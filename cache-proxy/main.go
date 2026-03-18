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

	// Analytics client with timeout
	analyticsClient = &http.Client{
		Timeout: 10 * time.Second,
	}

	// Main router
	http.HandleFunc("/cache/purge/", handlePurge)
	http.HandleFunc("/anal/", handleAnalytics)
	http.HandleFunc("/", handleProxy)

	port := getEnv("PORT", "8080")
	log.Printf("Cache proxy starting on :%s", port)
	log.Printf("Astro upstream: %s", astroUpstream)
	log.Fatal(http.ListenAndServe(":"+port, nil))
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
	} else {
		cacheKey = "match:" + path
	}

	recordPurge(cacheKey)
	deleteCacheEntry(cacheKey)

	// If purging a match, also purge root (match list contains this match)
	if path != "root" {
		recordPurge("root")
		deleteCacheEntry("root")
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
		cacheKey = "root"
		ttl = 720 * time.Hour // 30 days
	case strings.HasPrefix(r.URL.Path, "/matches/"):
		// Extract GUID from path
		parts := strings.Split(r.URL.Path, "/")
		if len(parts) >= 3 {
			cacheKey = "match:" + parts[2]
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
	w.Header().Set("Cache-Control", "public, s-maxage=2592000, max-age=0, must-revalidate")
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

func cachePaths(cacheKey string) (string, string) {
	cacheFile := filepath.Join(cacheDir, hashKey(cacheKey))
	return cacheFile, cacheFile + ".meta"
}

func purgePath(cacheKey string) string {
	return filepath.Join(cacheDir, hashKey(cacheKey)+".purged")
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

	cacheFile, metaFile := cachePaths(cacheKey)
	if err := os.Remove(cacheFile); err != nil && !os.IsNotExist(err) {
		log.Printf("Failed to remove cache file %s: %v", cacheFile, err)
	}
	if err := os.Remove(metaFile); err != nil && !os.IsNotExist(err) {
		log.Printf("Failed to remove meta file %s: %v", metaFile, err)
	}
}

func recordPurge(cacheKey string) {
	cacheMu.Lock()
	defer cacheMu.Unlock()

	if err := os.WriteFile(purgePath(cacheKey), []byte(time.Now().UTC().Format(time.RFC3339)), 0644); err != nil {
		log.Printf("Failed to record purge time for %s: %v", cacheKey, err)
	}
}

func readPurgeTime(cacheKey string) (time.Time, error) {
	data, err := os.ReadFile(purgePath(cacheKey))
	if err != nil {
		if errors.Is(err, os.ErrNotExist) {
			return time.Time{}, nil
		}
		return time.Time{}, err
	}

	parsed, err := time.Parse(time.RFC3339, strings.TrimSpace(string(data)))
	if err != nil {
		return time.Time{}, err
	}

	return parsed, nil
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
