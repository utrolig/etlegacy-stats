# Nginx with cache purge module
FROM nginx:alpine AS builder

# Install build dependencies
RUN apk add --no-cache \
    gcc \
    g++ \
    make \
    pcre-dev \
    zlib-dev \
    openssl-dev \
    linux-headers \
    git \
    wget

# Download nginx source and cache-purge module
WORKDIR /tmp
RUN NGINX_VERSION=$(nginx -v 2>&1 | sed -n 's/.*nginx\/\([0-9]\+\.[0-9]\+\.[0-9]\+\).*/\1/p') && \
    wget http://nginx.org/download/nginx-${NGINX_VERSION}.tar.gz && \
    tar -xzf nginx-${NGINX_VERSION}.tar.gz && \
    git clone https://github.com/nginx-modules/ngx_cache_purge.git

# Build nginx with cache-purge module
# Use minimal configure flags compatible with Alpine
WORKDIR /tmp
RUN NGINX_VERSION=$(nginx -v 2>&1 | sed -n 's/.*nginx\/\([0-9]\+\.[0-9]\+\.[0-9]\+\).*/\1/p') && \
    cd nginx-${NGINX_VERSION} && \
    ./configure \
        --prefix=/etc/nginx \
        --sbin-path=/usr/sbin/nginx \
        --modules-path=/usr/lib/nginx/modules \
        --conf-path=/etc/nginx/nginx.conf \
        --error-log-path=/var/log/nginx/error.log \
        --http-log-path=/var/log/nginx/access.log \
        --pid-path=/var/run/nginx.pid \
        --lock-path=/var/run/nginx.lock \
        --http-client-body-temp-path=/var/cache/nginx/client_temp \
        --http-proxy-temp-path=/var/cache/nginx/proxy_temp \
        --http-fastcgi-temp-path=/var/cache/nginx/fastcgi_temp \
        --http-uwsgi-temp-path=/var/cache/nginx/uwsgi_temp \
        --http-scgi-temp-path=/var/cache/nginx/scgi_temp \
        --with-compat \
        --with-file-aio \
        --with-http_addition_module \
        --with-http_auth_request_module \
        --with-http_dav_module \
        --with-http_flv_module \
        --with-http_gunzip_module \
        --with-http_gzip_static_module \
        --with-http_mp4_module \
        --with-http_random_index_module \
        --with-http_realip_module \
        --with-http_secure_link_module \
        --with-http_slice_module \
        --with-http_ssl_module \
        --with-http_stub_status_module \
        --with-http_sub_module \
        --with-http_v2_module \
        --with-http_v3_module \
        --with-mail \
        --with-mail_ssl_module \
        --with-stream \
        --with-stream_realip_module \
        --with-stream_ssl_module \
        --with-stream_ssl_preread_module \
        --add-dynamic-module=../ngx_cache_purge && \
    make modules && \
    cp objs/ngx_http_cache_purge_module.so /tmp/ngx_http_cache_purge_module.so

# Final image
FROM nginx:alpine

# Copy the cache purge module
COPY --from=builder /tmp/ngx_http_cache_purge_module.so /etc/nginx/modules/

# Create cache directory
RUN mkdir -p /var/cache/nginx && \
    chown -R nginx:nginx /var/cache/nginx

# Add module loader
RUN echo 'load_module /etc/nginx/modules/ngx_http_cache_purge_module.so;' > /etc/nginx/modules.conf

# Copy config template
COPY nginx.conf /etc/nginx/nginx.conf.template

# Entrypoint script
COPY docker-entrypoint.sh /docker-entrypoint.sh
RUN chmod +x /docker-entrypoint.sh

EXPOSE 80

ENTRYPOINT ["/docker-entrypoint.sh"]
CMD ["nginx", "-g", "daemon off;"]
