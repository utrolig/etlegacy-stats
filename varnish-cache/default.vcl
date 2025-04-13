vcl 4.1;

# Default backend definition using environment variables
backend default {
    .host = "astro-server";
    .port = "4321";
    .connect_timeout = 5s;
    .first_byte_timeout = 60s;
    .between_bytes_timeout = 10s;
    .max_connections = 300;
}

# Respond to health checks
sub vcl_recv {
    # Health check
    if (req.url == "/varnish-health") {
        return(synth(200, "OK"));
    }

    # Normalize Accept-Encoding header to improve cache hit rates
    if (req.http.Accept-Encoding) {
        if (req.http.Accept-Encoding ~ "gzip") {
            set req.http.Accept-Encoding = "gzip";
        } else if (req.http.Accept-Encoding ~ "deflate") {
            set req.http.Accept-Encoding = "deflate";
        } else {
            unset req.http.Accept-Encoding;
        }
    }

    # Only cache GET and HEAD requests
    if (req.method != "GET" && req.method != "HEAD") {
        return (pass);
    }

    # Handle special URLs that should bypass cache (admin pages, etc.)
    if (req.url ~ "^/admin" || req.url ~ "^/login") {
        return (pass);
    }

    # Default behavior: lookup cache
    return (hash);
}

sub vcl_backend_response {
    # Set default TTL for all responses if not defined by backend
    if (!beresp.ttl > 0s) {
        set beresp.ttl = 1h; # Default TTL: 1 hour
    }

    # Don't cache 50x responses
    if (beresp.status >= 500 && beresp.status < 600) {
        set beresp.uncacheable = true;
        return (deliver);
    }

    # Set a grace period for object fetches
    set beresp.grace = 1h;

    return (deliver);
}

sub vcl_deliver {
    # Add a header to indicate cache hit/miss
    if (obj.hits > 0) {
        set resp.http.X-Cache = "HIT";
        set resp.http.X-Cache-Hits = obj.hits;
    } else {
        set resp.http.X-Cache = "MISS";
    }

    # Remove the X-Powered-By header for security
    unset resp.http.X-Powered-By;

    return (deliver);
}
