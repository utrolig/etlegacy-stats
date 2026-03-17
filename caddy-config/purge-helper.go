package main

import (
	"encoding/json"
	"fmt"
	"io"
	"log"
	"net/http"
	"net/url"
	"os"
	"regexp"
	"strings"
	"time"
)

var guidPattern = regexp.MustCompile(`^[0-9a-fA-F-]+$`)

type responseBody struct {
	Success bool   `json:"success,omitempty"`
	Error   bool   `json:"error,omitempty"`
	Msg     string `json:"msg,omitempty"`
}

func main() {
	addr := envOrDefault("PURGE_HELPER_ADDR", "127.0.0.1:9080")
	token := strings.TrimSpace(os.Getenv("CACHE_PURGE_TOKEN"))
	souinURL := strings.TrimRight(
		envOrDefault("SOUIN_API_URL", "http://127.0.0.1:2019/souin-api/souin"),
		"/",
	)
	externalHost := envOrDefault("EXTERNAL_HOST", "simple-stats.stiba.lol")

	if token == "" {
		log.Fatal("CACHE_PURGE_TOKEN must be set")
	}

	client := &http.Client{Timeout: 10 * time.Second}
	mux := http.NewServeMux()
	mux.HandleFunc("/cache/purge/", func(w http.ResponseWriter, r *http.Request) {
		if r.Method != http.MethodPost {
			writeJSON(w, http.StatusMethodNotAllowed, responseBody{Error: true, Msg: "Method not allowed."})
			return
		}

		if got := r.Header.Get("Authorization"); got != "Bearer "+token {
			writeJSON(w, http.StatusUnauthorized, responseBody{Error: true, Msg: "Invalid token."})
			return
		}

		guid := strings.TrimPrefix(r.URL.Path, "/cache/purge/")
		if guid == "" || strings.Contains(guid, "/") || !guidPattern.MatchString(guid) {
			writeJSON(w, http.StatusBadRequest, responseBody{Error: true, Msg: "Invalid guid."})
			return
		}

		// Purge by exact cache keys since simplefs doesn't support surrogate key indexing
		keys := cacheKeys(externalHost, guid)
		if err := purgeByCacheKeys(client, souinURL, keys); err != nil {
			log.Printf("purge failed for guid %s: %v", guid, err)
			writeJSON(w, http.StatusBadGateway, responseBody{Error: true, Msg: "Failed to purge cache."})
			return
		}

		writeJSON(w, http.StatusOK, responseBody{Success: true})
	})

	log.Printf("purge helper listening on %s", addr)
	log.Printf("will purge keys for host: %s", externalHost)
	log.Fatal(http.ListenAndServe(addr, mux))
}

func purgeByCacheKeys(client *http.Client, souinURL string, keys []string) error {
	for _, key := range keys {
		req, err := http.NewRequest(
			"PURGE",
			souinURL+"/"+url.PathEscape(key),
			nil,
		)
		if err != nil {
			return err
		}

		resp, err := client.Do(req)
		if err != nil {
			return err
		}

		if resp.StatusCode < 200 || resp.StatusCode >= 300 {
			body, _ := io.ReadAll(io.LimitReader(resp.Body, 4096))
			resp.Body.Close()
			return fmt.Errorf("souin purge returned %d for key %q: %s", resp.StatusCode, key, strings.TrimSpace(string(body)))
		}

		resp.Body.Close()
		log.Printf("purged cache key: %s", key)
	}

	return nil
}

func cacheKeys(host, guid string) []string {
	// Souin cache key format: GET-http-<host>-<path>
	// Based on your header: GET-http-simple-stats.stiba.lol-/matches/9c8e8ca2-c006-529a-a6b0-62013fc1f637
	return []string{
		fmt.Sprintf("GET-http-%s-/", host),
		fmt.Sprintf("GET-http-%s-/matches/%s", host, guid),
	}
}

func writeJSON(w http.ResponseWriter, status int, body responseBody) {
	payload, err := json.Marshal(body)
	if err != nil {
		http.Error(w, `{"error":true,"msg":"Failed to encode response."}`, http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)
	_, _ = w.Write(payload)
}

func envOrDefault(key, fallback string) string {
	if value := strings.TrimSpace(os.Getenv(key)); value != "" {
		return value
	}

	return fallback
}
