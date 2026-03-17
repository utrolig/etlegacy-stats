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
RUN NGINX_VERSION=$(nginx -v 2>&1 | grep -oP '\d+\.\d+\.\d+') && \
    wget http://nginx.org/download/nginx-${NGINX_VERSION}.tar.gz && \
    tar -xzf nginx-${NGINX_VERSION}.tar.gz && \
    git clone https://github.com/nginx-modules/ngx_cache_purge.git

# Build nginx with cache-purge module
WORKDIR /tmp/nginx-${NGINX_VERSION}
RUN ./configure \
    --with-compat \
    --add-dynamic-module=../ngx_cache_purge \
    $(nginx -V 2>&1 | grep 'configure arguments:' | sed 's/configure arguments: //') && \
    make modules

# Final image
FROM nginx:alpine

# Copy the cache purge module
COPY --from=builder /tmp/nginx-*/objs/ngx_http_cache_purge_module.so /etc/nginx/modules/

# Load the module in nginx.conf
RUN mkdir -p /var/cache/nginx && \
    chown -R nginx:nginx /var/cache/nginx

# Add module loader to main nginx.conf
RUN echo 'load_module /etc/nginx/modules/ngx_http_cache_purge_module.so;' > /etc/nginx/modules.conf

# Copy config template
COPY nginx.conf /etc/nginx/nginx.conf.template

# Entrypoint script to substitute env vars
COPY docker-entrypoint.sh /docker-entrypoint.sh
RUN chmod +x /docker-entrypoint.sh

EXPOSE 80

ENTRYPOINT ["/docker-entrypoint.sh"]
CMD ["nginx", "-g", "daemon off;"]
