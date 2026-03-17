package main

import (
	"encoding/json"
	"fmt"
	"io"
	"log"
	"net/http"
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

		// Purge by surrogate keys - works properly with Badger storage
		keys := surrogateKeys(guid)
		if err := purgeBySurrogateKeys(client, souinURL, keys); err != nil {
			log.Printf("purge failed for guid %s: %v", guid, err)
			writeJSON(w, http.StatusBadGateway, responseBody{Error: true, Msg: "Failed to purge cache."})
			return
		}

		writeJSON(w, http.StatusOK, responseBody{Success: true})
	})

	log.Printf("purge helper listening on %s", addr)
	log.Printf("purge helper started")
	log.Fatal(http.ListenAndServe(addr, mux))
}

func purgeBySurrogateKeys(client *http.Client, souinURL string, keys []string) error {
	for _, key := range keys {
		req, err := http.NewRequest(
			"PURGE",
			souinURL+"/",
			nil,
		)
		if err != nil {
			return err
		}
		req.Header.Set("Surrogate-Key", key)

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
		log.Printf("purged surrogate-key: %s", key)
	}

	return nil
}

func surrogateKeys(guid string) []string {
	return []string{
		"root",
		"match-" + guid,
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
