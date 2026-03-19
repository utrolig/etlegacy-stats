package main

import (
	"io"
	"net/http"
	"net/http/httptest"
	"os"
	"path/filepath"
	"testing"
	"time"
)

func TestCacheHitsHeaderIncrements(t *testing.T) {
	proxy := newTestProxy(t)

	first := proxy.request(t, "/matches/test-guid")
	if first.Code != http.StatusOK {
		t.Fatalf("expected 200, got %d", first.Code)
	}
	if got := first.Header().Get("X-Cache-Status"); got != "MISS" {
		t.Fatalf("expected MISS on first request, got %q", got)
	}
	if got := first.Header().Get("X-Cache-Hits"); got != "0" {
		t.Fatalf("expected hit count 0 on miss, got %q", got)
	}
	if got := first.Header().Get("X-Cache-Last-Purged"); got != "" {
		t.Fatalf("expected no last-purged header before purge, got %q", got)
	}

	second := proxy.request(t, "/matches/test-guid")
	if got := second.Header().Get("X-Cache-Status"); got != "HIT" {
		t.Fatalf("expected HIT on second request, got %q", got)
	}
	if got := second.Header().Get("X-Cache-Hits"); got != "1" {
		t.Fatalf("expected hit count 1 on first cache hit, got %q", got)
	}

	third := proxy.request(t, "/matches/test-guid")
	if got := third.Header().Get("X-Cache-Hits"); got != "2" {
		t.Fatalf("expected hit count 2 on second cache hit, got %q", got)
	}
}

func TestPurgePersistsLastPurgedForRecreatedEntries(t *testing.T) {
	proxy := newTestProxy(t)

	proxy.request(t, "/")
	proxy.request(t, "/matches/test-guid")
	proxy.request(t, "/matches/test-guid?map=etl_adlernest")

	purgeReq := httptest.NewRequest(http.MethodPost, "/cache/purge/test-guid", nil)
	purgeReq.Header.Set("Authorization", "Bearer test-token")
	purgeResp := httptest.NewRecorder()
	handlePurge(purgeResp, purgeReq)
	if purgeResp.Code != http.StatusOK {
		t.Fatalf("expected purge status 200, got %d", purgeResp.Code)
	}

	matchMetaPath := filepath.Join(cacheDir, hashKey("match:test-guid")+".meta")
	if _, err := os.Stat(matchMetaPath); !os.IsNotExist(err) {
		t.Fatalf("expected match cache metadata to be deleted, stat err=%v", err)
	}
	matchVariantMetaPath := filepath.Join(cacheDir, hashKey("match:test-guid?map=etl_adlernest")+".meta")
	if _, err := os.Stat(matchVariantMetaPath); !os.IsNotExist(err) {
		t.Fatalf("expected match variant cache metadata to be deleted, stat err=%v", err)
	}

	recachedMatch := proxy.request(t, "/matches/test-guid")
	lastPurged := recachedMatch.Header().Get("X-Cache-Last-Purged")
	if lastPurged == "" {
		t.Fatal("expected last-purged header on recached match response")
	}
	if _, err := time.Parse(time.RFC3339, lastPurged); err != nil {
		t.Fatalf("expected RFC3339 timestamp, got %q: %v", lastPurged, err)
	}
	if got := recachedMatch.Header().Get("X-Cache-Hits"); got != "0" {
		t.Fatalf("expected hit count reset to 0 after recache, got %q", got)
	}

	hitAfterRecache := proxy.request(t, "/matches/test-guid")
	if got := hitAfterRecache.Header().Get("X-Cache-Hits"); got != "1" {
		t.Fatalf("expected hit count 1 after recache hit, got %q", got)
	}
	if got := hitAfterRecache.Header().Get("X-Cache-Last-Purged"); got != lastPurged {
		t.Fatalf("expected last-purged to persist across hits, got %q want %q", got, lastPurged)
	}

	recachedRoot := proxy.request(t, "/")
	rootLastPurged := recachedRoot.Header().Get("X-Cache-Last-Purged")
	if rootLastPurged == "" {
		t.Fatal("expected root to inherit a purge timestamp after match purge")
	}

	recachedMatchVariant := proxy.request(t, "/matches/test-guid?map=etl_adlernest")
	variantLastPurged := recachedMatchVariant.Header().Get("X-Cache-Last-Purged")
	if variantLastPurged == "" {
		t.Fatal("expected match variant to retain last-purged header after family purge")
	}
}

func TestNonCachedRoutesDoNotEmitCacheEntryHeaders(t *testing.T) {
	proxy := newTestProxy(t)

	resp := proxy.request(t, "/search/example")
	if got := resp.Header().Get("X-Cache-Hits"); got != "" {
		t.Fatalf("expected no X-Cache-Hits header on non-cached route, got %q", got)
	}
	if got := resp.Header().Get("X-Cache-Last-Purged"); got != "" {
		t.Fatalf("expected no X-Cache-Last-Purged header on non-cached route, got %q", got)
	}
}

func TestMatchQueryVariantsUseDistinctCacheEntries(t *testing.T) {
	proxy := newTestProxy(t)

	base := proxy.request(t, "/matches/test-guid")
	if got := base.Body.String(); got != "<html>/matches/test-guid</html>" {
		t.Fatalf("unexpected base body %q", got)
	}

	mapVariant := proxy.request(t, "/matches/test-guid?map=etl_adlernest")
	if got := mapVariant.Header().Get("X-Cache-Status"); got != "MISS" {
		t.Fatalf("expected MISS for first map variant request, got %q", got)
	}
	if got := mapVariant.Body.String(); got != "<html>/matches/test-guid?map=etl_adlernest</html>" {
		t.Fatalf("unexpected map variant body %q", got)
	}

	mapVariantHit := proxy.request(t, "/matches/test-guid?map=etl_adlernest")
	if got := mapVariantHit.Header().Get("X-Cache-Status"); got != "HIT" {
		t.Fatalf("expected HIT for cached map variant, got %q", got)
	}
	if got := mapVariantHit.Body.String(); got != "<html>/matches/test-guid?map=etl_adlernest</html>" {
		t.Fatalf("unexpected cached map variant body %q", got)
	}

	roundVariant := proxy.request(t, "/matches/test-guid?map=etl_adlernest&round=2")
	if got := roundVariant.Header().Get("X-Cache-Status"); got != "MISS" {
		t.Fatalf("expected MISS for first round variant request, got %q", got)
	}
	if got := roundVariant.Body.String(); got != "<html>/matches/test-guid?map=etl_adlernest&round=2</html>" {
		t.Fatalf("unexpected round variant body %q", got)
	}

	baseHit := proxy.request(t, "/matches/test-guid")
	if got := baseHit.Header().Get("X-Cache-Status"); got != "HIT" {
		t.Fatalf("expected HIT for cached base match, got %q", got)
	}
	if got := baseHit.Body.String(); got != "<html>/matches/test-guid</html>" {
		t.Fatalf("unexpected cached base body %q", got)
	}
}

func TestRootQueryVariantsUseDistinctCacheEntries(t *testing.T) {
	proxy := newTestProxy(t)

	base := proxy.request(t, "/")
	if got := base.Header().Get("X-Cache-Status"); got != "MISS" {
		t.Fatalf("expected base root request to be cached with MISS on first load, got %q", got)
	}
	if got := base.Header().Get("X-Cache-Hits"); got != "0" {
		t.Fatalf("expected base root request hit count 0, got %q", got)
	}

	pageVariant := proxy.request(t, "/?page=1")
	if got := pageVariant.Header().Get("X-Cache-Status"); got != "MISS" {
		t.Fatalf("expected first page variant request to be cached with MISS, got %q", got)
	}
	if got := pageVariant.Header().Get("X-Cache-Hits"); got != "0" {
		t.Fatalf("expected first page variant hit count 0, got %q", got)
	}
	if got := pageVariant.Body.String(); got != "<html>/?page=1</html>" {
		t.Fatalf("unexpected first page variant body %q", got)
	}

	sizeVariant := proxy.request(t, "/?page=1&size=12")
	if got := sizeVariant.Header().Get("X-Cache-Status"); got != "MISS" {
		t.Fatalf("expected first size variant request to be cached with MISS, got %q", got)
	}
	if got := sizeVariant.Header().Get("X-Cache-Hits"); got != "0" {
		t.Fatalf("expected first size variant hit count 0, got %q", got)
	}
	if got := sizeVariant.Body.String(); got != "<html>/?page=1&size=12</html>" {
		t.Fatalf("unexpected size variant body %q", got)
	}

	baseHit := proxy.request(t, "/")
	if got := baseHit.Header().Get("X-Cache-Status"); got != "HIT" {
		t.Fatalf("expected bare root request to remain cached, got %q", got)
	}
	if got := baseHit.Header().Get("X-Cache-Hits"); got != "1" {
		t.Fatalf("expected bare root request hit count 1, got %q", got)
	}

	pageVariantHit := proxy.request(t, "/?page=1")
	if got := pageVariantHit.Header().Get("X-Cache-Status"); got != "HIT" {
		t.Fatalf("expected cached page variant request to be HIT, got %q", got)
	}
	if got := pageVariantHit.Header().Get("X-Cache-Hits"); got != "1" {
		t.Fatalf("expected cached page variant hit count 1, got %q", got)
	}

	sizeVariantHit := proxy.request(t, "/?page=1&size=12")
	if got := sizeVariantHit.Header().Get("X-Cache-Status"); got != "HIT" {
		t.Fatalf("expected cached size variant request to be HIT, got %q", got)
	}
	if got := sizeVariantHit.Header().Get("X-Cache-Hits"); got != "1" {
		t.Fatalf("expected cached size variant hit count 1, got %q", got)
	}
}

func TestRootPurgeClearsAllRootVariants(t *testing.T) {
	proxy := newTestProxy(t)

	proxy.request(t, "/")
	proxy.request(t, "/?page=1")
	proxy.request(t, "/?page=1&size=12")

	purgeReq := httptest.NewRequest(http.MethodPost, "/cache/purge/root", nil)
	purgeReq.Header.Set("Authorization", "Bearer test-token")
	purgeResp := httptest.NewRecorder()
	handlePurge(purgeResp, purgeReq)
	if purgeResp.Code != http.StatusOK {
		t.Fatalf("expected purge status 200, got %d", purgeResp.Code)
	}

	recachedPageVariant := proxy.request(t, "/?page=1")
	if got := recachedPageVariant.Header().Get("X-Cache-Status"); got != "MISS" {
		t.Fatalf("expected root variant to miss after root purge, got %q", got)
	}
	if got := recachedPageVariant.Header().Get("X-Cache-Last-Purged"); got == "" {
		t.Fatal("expected root variant to inherit last-purged after root purge")
	}

	recachedSizeVariant := proxy.request(t, "/?page=1&size=12")
	if got := recachedSizeVariant.Header().Get("X-Cache-Status"); got != "MISS" {
		t.Fatalf("expected size root variant to miss after root purge, got %q", got)
	}
	if got := recachedSizeVariant.Header().Get("X-Cache-Last-Purged"); got == "" {
		t.Fatal("expected size root variant to inherit last-purged after root purge")
	}
}

func TestMatchPurgeClearsAllMatchVariants(t *testing.T) {
	proxy := newTestProxy(t)

	proxy.request(t, "/matches/test-guid")
	proxy.request(t, "/matches/test-guid?map=etl_adlernest")
	proxy.request(t, "/matches/test-guid?map=etl_adlernest&round=2")

	purgeReq := httptest.NewRequest(http.MethodPost, "/cache/purge/test-guid", nil)
	purgeReq.Header.Set("Authorization", "Bearer test-token")
	purgeResp := httptest.NewRecorder()
	handlePurge(purgeResp, purgeReq)
	if purgeResp.Code != http.StatusOK {
		t.Fatalf("expected purge status 200, got %d", purgeResp.Code)
	}

	recachedBase := proxy.request(t, "/matches/test-guid")
	if got := recachedBase.Header().Get("X-Cache-Status"); got != "MISS" {
		t.Fatalf("expected base match to miss after family purge, got %q", got)
	}
	if got := recachedBase.Header().Get("X-Cache-Last-Purged"); got == "" {
		t.Fatal("expected base match to keep last-purged after family purge")
	}

	recachedMap := proxy.request(t, "/matches/test-guid?map=etl_adlernest")
	if got := recachedMap.Header().Get("X-Cache-Status"); got != "MISS" {
		t.Fatalf("expected map variant to miss after family purge, got %q", got)
	}
	if got := recachedMap.Header().Get("X-Cache-Last-Purged"); got == "" {
		t.Fatal("expected map variant to keep last-purged after family purge")
	}

	recachedRound := proxy.request(t, "/matches/test-guid?map=etl_adlernest&round=2")
	if got := recachedRound.Header().Get("X-Cache-Status"); got != "MISS" {
		t.Fatalf("expected round variant to miss after family purge, got %q", got)
	}
	if got := recachedRound.Header().Get("X-Cache-Last-Purged"); got == "" {
		t.Fatal("expected round variant to keep last-purged after family purge")
	}
}

type testProxy struct {
}

func newTestProxy(t *testing.T) *testProxy {
	t.Helper()

	astroProxyFunc = func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "text/html; charset=utf-8")
		body := r.URL.Path
		if r.URL.RawQuery != "" {
			body += "?" + r.URL.RawQuery
		}
		io.WriteString(w, "<html>"+body+"</html>")
	}
	t.Cleanup(func() {
		astroProxyFunc = proxyToAstro
	})

	cacheDir = t.TempDir()
	astroUpstream = "http://example.test"
	purgeToken = "test-token"
	analyticsClient = &http.Client{Timeout: time.Second}

	return &testProxy{}
}

func (p *testProxy) request(t *testing.T, path string) *httptest.ResponseRecorder {
	t.Helper()

	req := httptest.NewRequest(http.MethodGet, path, nil)
	resp := httptest.NewRecorder()
	handleProxy(resp, req)
	return resp
}
