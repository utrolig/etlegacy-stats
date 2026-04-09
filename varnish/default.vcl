vcl 4.1;

import std;

backend astro {
    .host = "etlegacy-astro";
    .port = "4321";
    .connect_timeout = 5s;
    .first_byte_timeout = 30s;
    .between_bytes_timeout = 10s;
}

# IPs allowed to send PURGE requests.
# Add your Coolify internal network CIDR here if purging from outside the container.
acl purge_acl {
    "localhost";
    "127.0.0.1";
    "::1";
    "etlegacy-astro";
}

sub vcl_recv {
    # Handle PURGE requests
    if (req.method == "PURGE") {
        if (!client.ip ~ purge_acl) {
            return (synth(405, "Not allowed"));
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

    # Strip cookies and auth headers so Varnish treats responses as cacheable
    unset req.http.Cookie;
    unset req.http.Authorization;

    return (hash);
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
    # Everything else (search, static assets, etc.): don't cache
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
