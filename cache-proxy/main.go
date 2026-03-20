package main

import (
	"bytes"
	"crypto/sha256"
	"encoding/hex"
	"encoding/json"
	"errors"
	"io"
	"log"
	"net/http"
	"net/http/httputil"
	"net/url"
	"os"
	"path/filepath"
	"strconv"
	"strings"
	"sync"
	"time"
)

var (
	astroUpstream   string
	purgeToken      string
	cacheDir        string
	analyticsClient *http.Client
	cacheMu         sync.Mutex
	astroProxyFunc  = proxyToAstro
)

func main() {
	astroUpstream = getEnv("ASTRO_UPSTREAM", "http://localhost:4321")
	purgeToken = getEnv("CACHE_PURGE_TOKEN", "")
	cacheDir = getEnv("CACHE_DIR", "/var/cache/proxy")

	if purgeToken == "" {
		log.Fatal("CACHE_PURGE_TOKEN must be set")
	}

	// Create cache directory
	if err := os.MkdirAll(cacheDir, 0755); err != nil {
		log.Fatalf("Failed to create cache dir: %v", err)
	}

	// Clear all files in cache directory on boot
	if err := clearCacheDir(); err != nil {
		log.Printf("Warning: failed to clear cache dir: %v", err)
	}

	// Analytics client with timeout
	analyticsClient = &http.Client{
		Timeout: 10 * time.Second,
	}

	// Main router
	http.HandleFunc("/cache/purge/", handlePurge)
	http.HandleFunc("/cache/nuke", handleNukeCache)
	http.HandleFunc("/anal/", handleAnalytics)
	http.HandleFunc("/", handleProxy)

	port := getEnv("PORT", "8080")
	log.Printf("Cache proxy starting on :%s", port)
	log.Printf("Astro upstream: %s", astroUpstream)
	log.Fatal(http.ListenAndServe(":"+port, nil))
}

func clearCacheDir() error {
	entries, err := os.ReadDir(cacheDir)
	if err != nil {
		return err
	}

	for _, entry := range entries {
		if !entry.IsDir() {
			path := filepath.Join(cacheDir, entry.Name())
			if err := os.Remove(path); err != nil {
				log.Printf("Failed to remove cache file %s: %v", path, err)
			}
		}
	}

	log.Printf("Cleared cache directory on boot")
	return nil
}

func handleNukeCache(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	// Auth check
	auth := r.Header.Get("Authorization")
	if auth != "Bearer "+purgeToken && r.RemoteAddr != "127.0.0.1" {
		http.Error(w, "Unauthorized", http.StatusUnauthorized)
		return
	}

	// Get all cache keys and delete them
	cacheMu.Lock()
	keys, err := listCacheKeysLocked()
	if err != nil {
		cacheMu.Unlock()
		log.Printf("Failed to list cache keys for nuke: %v", err)
		http.Error(w, "Failed to list cache", http.StatusInternalServerError)
		return
	}

	// Clear all entries
	for _, key := range keys {
		deleteCacheEntryLocked(key)
	}

	// Clear the keys list
	if err := writeCacheKeysLocked([]string{}); err != nil {
		log.Printf("Failed to clear cache keys file: %v", err)
	}
	cacheMu.Unlock()

	log.Printf("Nuked %d cache entries", len(keys))
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]interface{}{
		"success": true,
		"purged":  len(keys),
	})
}

func handlePurge(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	// Auth check
	auth := r.Header.Get("Authorization")
	if auth != "Bearer "+purgeToken && r.RemoteAddr != "127.0.0.1" {
		http.Error(w, "Unauthorized", http.StatusUnauthorized)
		return
	}

	// Extract key from path
	path := strings.TrimPrefix(r.URL.Path, "/cache/purge/")
	if path == "" {
		http.Error(w, "Invalid path", http.StatusBadRequest)
		return
	}

	var cacheKey string
	if path == "root" {
		cacheKey = "root"
		purgeCacheFamily("root")
	} else {
		cacheKey = "match:" + path
		purgeCacheFamily(cacheKey)
	}

	// If purging a match, also purge root (match list contains this match)
	if path != "root" {
		purgeCacheFamily("root")
		log.Printf("Also purged root (due to match purge)")
	}

	log.Printf("Purged cache key: %s", cacheKey)
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]bool{"success": true})
}

func handleAnalytics(w http.ResponseWriter, r *http.Request) {
	// Rewrite analytics paths
	var targetPath string
	switch r.URL.Path {
	case "/anal/a/script.js":
		targetPath = "/collect/analytics/script.js"
	case "/anal/m/script.js":
		targetPath = "/collect/metrics/script.js"
	case "/anal/a":
		targetPath = "/collect/analytics/report"
	case "/anal/m":
		targetPath = "/collect/metrics/report"
	default:
		http.NotFound(w, r)
		return
	}

	// Create new request to analytics
	url := "https://app.lythia.dev" + targetPath
	req, err := http.NewRequest(r.Method, url, r.Body)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	// Copy headers
	req.Header = r.Header.Clone()
	req.Header.Set("Host", "app.lythia.dev")
	req.Header.Del("Accept-Encoding") // Let Go handle compression

	// Do request
	resp, err := analyticsClient.Do(req)
	if err != nil {
		log.Printf("Analytics proxy error: %v", err)
		http.Error(w, err.Error(), http.StatusBadGateway)
		return
	}
	defer resp.Body.Close()

	// Copy response
	for k, v := range resp.Header {
		for _, vv := range v {
			w.Header().Add(k, vv)
		}
	}
	w.WriteHeader(resp.StatusCode)
	io.Copy(w, resp.Body)
}

func handleProxy(w http.ResponseWriter, r *http.Request) {
	// Determine cache key and TTL based on path
	var cacheKey string
	var ttl time.Duration

	switch {
	case r.URL.Path == "/":
		if rootCacheKey := getRootCacheKey(r); rootCacheKey != "" {
			cacheKey = rootCacheKey
			ttl = 720 * time.Hour // 30 days
		}
	case strings.HasPrefix(r.URL.Path, "/matches/"):
		if matchCacheKey := getMatchCacheKey(r); matchCacheKey != "" {
			cacheKey = matchCacheKey
			ttl = 720 * time.Hour
		}
	case strings.HasPrefix(r.URL.Path, "/search/") || strings.HasPrefix(r.URL.Path, "/api/"):
		// No cache for search/API
		astroProxyFunc(w, r)
		return
	case isStaticAsset(r.URL.Path):
		// Pass through to Astro but add cache headers
		proxyToAstroWithCacheHeader(w, r)
		return
	}

	if cacheKey == "" {
		// Default: no cache
		astroProxyFunc(w, r)
		return
	}

	// Try to serve from cache
	if cached := serveFromCache(w, r, cacheKey, ttl); cached {
		return
	}

	// Fetch from upstream and cache
	fetchAndCache(w, r, cacheKey, ttl)
}

func proxyToAstro(w http.ResponseWriter, r *http.Request) {
	target, _ := url.Parse(astroUpstream)
	proxy := httputil.NewSingleHostReverseProxy(target)
	proxy.ErrorHandler = func(w http.ResponseWriter, r *http.Request, err error) {
		log.Printf("Proxy error: %v", err)
		http.Error(w, err.Error(), http.StatusBadGateway)
	}
	proxy.ServeHTTP(w, r)
}

func proxyToAstroWithCacheHeader(w http.ResponseWriter, r *http.Request) {
	// Wrap response writer to add cache headers
	rw := &responseWriterWithHeader{
		ResponseWriter: w,
		headerCallback: func(h http.Header) {
			h.Set("Cache-Control", "public, max-age=31536000, immutable")
		},
	}
	astroProxyFunc(rw, r)
}

type responseWriterWithHeader struct {
	http.ResponseWriter
	headerCallback func(http.Header)
	wroteHeader    bool
}

func (r *responseWriterWithHeader) WriteHeader(status int) {
	if !r.wroteHeader {
		r.headerCallback(r.Header())
		r.wroteHeader = true
	}
	r.ResponseWriter.WriteHeader(status)
}

func serveFromCache(w http.ResponseWriter, _ *http.Request, cacheKey string, ttl time.Duration) bool {
	cacheMu.Lock()
	meta, data, purgeTime, ok := loadCacheEntry(cacheKey, ttl)
	if !ok {
		cacheMu.Unlock()
		return false
	}

	meta.Hits++
	if err := writeCacheMeta(cacheKey, meta); err != nil {
		log.Printf("Failed to update cache hits for %s: %v", cacheKey, err)
	}
	cacheMu.Unlock()

	for k, v := range meta.Headers {
		// Skip cache headers - only the proxy should cache HTML
		if k == "Cache-Control" || k == "Expires" || k == "Pragma" {
			continue
		}
		for _, vv := range v {
			w.Header().Add(k, vv)
		}
	}
	w.Header().Set("X-Cache-Status", "HIT")
	w.Header().Set("X-Cache-Hits", intToString(meta.Hits))
	if !purgeTime.IsZero() {
		w.Header().Set("X-Cache-Last-Purged", purgeTime.UTC().Format(time.RFC3339))
	}
	w.WriteHeader(meta.Status)
	w.Write(data)
	return true
}

func fetchAndCache(w http.ResponseWriter, r *http.Request, cacheKey string, _ time.Duration) {
	purgeTime, err := readPurgeTime(cacheKey)
	if err != nil {
		log.Printf("Failed to read purge time for %s: %v", cacheKey, err)
	}

	// Create a custom response writer to capture the response
	captured := &captureWriter{ResponseWriter: w}
	w.Header().Set("X-Cache-Status", "MISS")
	w.Header().Set("X-Cache-Hits", "0")
	if !purgeTime.IsZero() {
		w.Header().Set("X-Cache-Last-Purged", purgeTime.UTC().Format(time.RFC3339))
	}
	astroProxyFunc(captured, r)

	// Save to cache
	saveToCache(cacheKey, captured.status, captured.headers, captured.body.Bytes())
}

type captureWriter struct {
	http.ResponseWriter
	status  int
	headers http.Header
	body    bytes.Buffer
	wrote   bool
}

func (c *captureWriter) WriteHeader(status int) {
	if !c.wrote {
		c.status = status
		c.headers = c.Header().Clone()
		c.wrote = true
	}
	c.ResponseWriter.WriteHeader(status)
}

func (c *captureWriter) Write(p []byte) (int, error) {
	// If WriteHeader hasn't been called yet, capture default 200 status
	if !c.wrote {
		c.status = http.StatusOK
		c.headers = c.Header().Clone()
		c.wrote = true
	}
	c.body.Write(p)
	return c.ResponseWriter.Write(p)
}

func saveToCache(cacheKey string, status int, headers http.Header, body []byte) {
	cacheMu.Lock()
	defer cacheMu.Unlock()

	cacheFile, _ := cachePaths(cacheKey)

	// Save body
	if err := os.WriteFile(cacheFile, body, 0644); err != nil {
		log.Printf("Failed to write cache: %v", err)
		return
	}

	// Save metadata
	meta := cacheMeta{
		Status:  status,
		Headers: headers,
		Hits:    0,
	}
	if err := writeCacheMeta(cacheKey, meta); err != nil {
		log.Printf("Failed to write cache meta: %v", err)
	}
	if err := registerCacheKeyLocked(cacheKey); err != nil {
		log.Printf("Failed to register cache key %s: %v", cacheKey, err)
	}
}

func isStaticAsset(path string) bool {
	exts := []string{".js", ".css", ".woff", ".woff2", ".svg", ".avif", ".png", ".jpg", ".jpeg", ".gif", ".ico"}
	lower := strings.ToLower(path)
	for _, ext := range exts {
		if strings.HasSuffix(lower, ext) {
			return true
		}
	}
	return false
}

func hashKey(key string) string {
	hash := sha256.Sum256([]byte(key))
	return hex.EncodeToString(hash[:])
}

func getRootCacheKey(r *http.Request) string {
	if r.URL.Path != "/" {
		return ""
	}

	cacheKey := "root"
	if query := r.URL.Query().Encode(); query != "" {
		cacheKey += "?" + query
	}

	return cacheKey
}

func getMatchCacheKey(r *http.Request) string {
	parts := strings.Split(r.URL.Path, "/")
	if len(parts) < 3 {
		return ""
	}

	cacheKey := "match:" + parts[2]
	params := r.URL.Query()
	if mapName := params.Get("map"); mapName != "" {
		cacheKey += "?map=" + mapName
	}
	if round := params.Get("round"); round != "" {
		cacheKey += "&round=" + round
	}

	return cacheKey
}

func cachePaths(cacheKey string) (string, string) {
	cacheFile := filepath.Join(cacheDir, hashKey(cacheKey))
	return cacheFile, cacheFile + ".meta"
}

func purgePath(cacheKey string) string {
	return filepath.Join(cacheDir, hashKey(cacheKey)+".purged")
}

func cacheKeysPath() string {
	return filepath.Join(cacheDir, "cache-keys.json")
}

func loadCacheEntry(cacheKey string, ttl time.Duration) (cacheMeta, []byte, time.Time, bool) {
	cacheFile, metaFile := cachePaths(cacheKey)

	info, err := os.Stat(cacheFile)
	if err != nil {
		return cacheMeta{}, nil, time.Time{}, false
	}

	if time.Since(info.ModTime()) > ttl {
		return cacheMeta{}, nil, time.Time{}, false
	}

	metaData, err := os.ReadFile(metaFile)
	if err != nil {
		return cacheMeta{}, nil, time.Time{}, false
	}

	var meta cacheMeta
	if err := json.Unmarshal(metaData, &meta); err != nil {
		return cacheMeta{}, nil, time.Time{}, false
	}

	data, err := os.ReadFile(cacheFile)
	if err != nil {
		return cacheMeta{}, nil, time.Time{}, false
	}

	purgeTime, err := readPurgeTime(cacheKey)
	if err != nil {
		log.Printf("Failed to read purge time for %s: %v", cacheKey, err)
	}

	return meta, data, purgeTime, true
}

func writeCacheMeta(cacheKey string, meta cacheMeta) error {
	_, metaFile := cachePaths(cacheKey)
	metaData, err := json.Marshal(meta)
	if err != nil {
		return err
	}
	return os.WriteFile(metaFile, metaData, 0644)
}

func deleteCacheEntry(cacheKey string) {
	cacheMu.Lock()
	defer cacheMu.Unlock()

	deleteCacheEntryLocked(cacheKey)
}

func deleteCacheEntryLocked(cacheKey string) {
	cacheFile, metaFile := cachePaths(cacheKey)
	if err := os.Remove(cacheFile); err != nil && !os.IsNotExist(err) {
		log.Printf("Failed to remove cache file %s: %v", cacheFile, err)
	}
	if err := os.Remove(metaFile); err != nil && !os.IsNotExist(err) {
		log.Printf("Failed to remove meta file %s: %v", metaFile, err)
	}
	if err := unregisterCacheKeyLocked(cacheKey); err != nil {
		log.Printf("Failed to unregister cache key %s: %v", cacheKey, err)
	}
}

func purgeCacheFamily(prefix string) {
	cacheMu.Lock()
	defer cacheMu.Unlock()

	keys, err := listCacheKeysLocked()
	if err != nil {
		log.Printf("Failed to list cache keys for purge family %s: %v", prefix, err)
	}

	recordPurgeLocked(prefix)
	for _, key := range keys {
		if key == prefix || strings.HasPrefix(key, prefix+"?") {
			recordPurgeLocked(key)
			deleteCacheEntryLocked(key)
		}
	}
}

func recordPurge(cacheKey string) {
	cacheMu.Lock()
	defer cacheMu.Unlock()

	recordPurgeLocked(cacheKey)
}

func recordPurgeLocked(cacheKey string) {
	if err := os.WriteFile(purgePath(cacheKey), []byte(time.Now().UTC().Format(time.RFC3339)), 0644); err != nil {
		log.Printf("Failed to record purge time for %s: %v", cacheKey, err)
	}
}

func readPurgeTime(cacheKey string) (time.Time, error) {
	data, err := os.ReadFile(purgePath(cacheKey))
	if err != nil {
		if !errors.Is(err, os.ErrNotExist) {
			return time.Time{}, err
		}
		if rootFamilyKey := getRootFamilyKey(cacheKey); rootFamilyKey != "" && rootFamilyKey != cacheKey {
			data, err = os.ReadFile(purgePath(rootFamilyKey))
			if err != nil {
				if errors.Is(err, os.ErrNotExist) {
					return time.Time{}, nil
				}
				return time.Time{}, err
			}
		} else {
			return time.Time{}, nil
		}
	}

	parsed, err := time.Parse(time.RFC3339, strings.TrimSpace(string(data)))
	if err != nil {
		return time.Time{}, err
	}

	return parsed, nil
}

func getRootFamilyKey(cacheKey string) string {
	if cacheKey == "root" || strings.HasPrefix(cacheKey, "root?") {
		return "root"
	}
	return ""
}

func registerCacheKeyLocked(cacheKey string) error {
	keys, err := listCacheKeysLocked()
	if err != nil {
		return err
	}

	for _, key := range keys {
		if key == cacheKey {
			return nil
		}
	}

	keys = append(keys, cacheKey)
	return writeCacheKeysLocked(keys)
}

func unregisterCacheKeyLocked(cacheKey string) error {
	keys, err := listCacheKeysLocked()
	if err != nil {
		return err
	}

	filtered := keys[:0]
	for _, key := range keys {
		if key != cacheKey {
			filtered = append(filtered, key)
		}
	}

	return writeCacheKeysLocked(filtered)
}

func listCacheKeysLocked() ([]string, error) {
	data, err := os.ReadFile(cacheKeysPath())
	if err != nil {
		if errors.Is(err, os.ErrNotExist) {
			return nil, nil
		}
		return nil, err
	}

	var keys []string
	if err := json.Unmarshal(data, &keys); err != nil {
		return nil, err
	}
	return keys, nil
}

func writeCacheKeysLocked(keys []string) error {
	data, err := json.Marshal(keys)
	if err != nil {
		return err
	}
	return os.WriteFile(cacheKeysPath(), data, 0644)
}

func intToString(v int64) string {
	return strconv.FormatInt(v, 10)
}

func getEnv(key, defaultVal string) string {
	if v := os.Getenv(key); v != "" {
		return v
	}
	return defaultVal
}

type cacheMeta struct {
	Status  int         `json:"status"`
	Headers http.Header `json:"headers"`
	Hits    int64       `json:"hits"`
}
