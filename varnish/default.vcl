vcl 4.1;

import std;
import dynamic;

backend default none;

sub vcl_init {
    new d = dynamic.director(
        port = "4321",
        ttl = 1s,
        connect_timeout = 5s,
        first_byte_timeout = 30s,
        between_bytes_timeout = 10s
    );
}

sub vcl_recv {
    # Health check — respond immediately without hitting the backend
    if (req.url == "/_health") {
        return (synth(200, "OK"));
    }

    # Resolve backend dynamically — re-resolves DNS every 1s so new container IPs
    # are picked up automatically after a rolling redeploy.
    set req.backend_hint = d.backend("etlegacy-astro");

    # Handle PURGE requests — open to any IP but require a Bearer token.
    # Set the PURGE_TOKEN environment variable on the Varnish container.
    if (req.method == "PURGE") {
        if (req.http.Authorization != {"Bearer "} + std.getenv("PURGE_TOKEN")) {
            return (synth(401, "Unauthorized"));
        }
        if (req.url == "/__purge-all") {
            ban("req.url ~ .");
            return (synth(200, "Banned all"));
        }
        return (purge);
    }

    # Never cache analytics proxy routes — pass straight through to Astro
    if (req.url ~ "^/anal/") {
        return (pass);
    }

    # Only cache GET and HEAD
    if (req.method != "GET" && req.method != "HEAD") {
        return (pass);
    }

    # Strip all cookies except preferDiscordNames, then normalize it to just
    # "true" or unset — Varnish will create two separate cache entries via vcl_hash.
    if (req.http.Cookie ~ "preferDiscordNames=true") {
        set req.http.Cookie = "preferDiscordNames=true";
    } else {
        unset req.http.Cookie;
    }
    unset req.http.Authorization;

    return (hash);
}

sub vcl_hash {
    hash_data(req.url);
    if (req.http.Cookie ~ "preferDiscordNames=true") {
        hash_data("preferDiscordNames=true");
    }
    return (lookup);
}

sub vcl_backend_response {
    # Match list page: 2h TTL, 10min grace (served stale during background refresh)
    if (bereq.url ~ "^/$" || bereq.url ~ "^\?") {
        set beresp.ttl = 2h;
        set beresp.grace = 10m;
    }
    # Match detail pages: 24h TTL, 10min grace
    else if (bereq.url ~ "^/matches/") {
        set beresp.ttl = 24h;
        set beresp.grace = 10m;
    }
    # Astro's built assets have content-hash filenames — safe to cache long-term.
    # Grace ensures they're available during backend sick window (e.g. deploys).
    else if (bereq.url ~ "^/_astro/") {
        set beresp.ttl = 365d;
        set beresp.grace = 10m;
    }
    # Everything else (search, etc.): don't cache
    else {
        set beresp.ttl = 0s;
        set beresp.uncacheable = true;
    }

    # Never cache error responses
    if (beresp.status >= 500) {
        set beresp.ttl = 0s;
        set beresp.uncacheable = true;
    }

    return (deliver);
}

sub vcl_deliver {
    if (obj.hits > 0) {
        set resp.http.X-Cache = "HIT";
    } else {
        set resp.http.X-Cache = "MISS";
    }
    set resp.http.X-Cache-Hits = obj.hits;
    return (deliver);
}
