# Isenkram - HTTP Proxy Server

## Overview
Isenkram is a caching HTTP proxy server written in Rust. It proxies HTTP requests to a destination server while providing caching capabilities for GET requests to improve performance.

## Features
- HTTP request proxying
- GET request caching with hit counters
- Cache headers (X-Isenkram-Cache, X-Isenkram-Cache-Hits)
- Configurable bind address and destination

## Environment Variables
- `ISENKRAM_DESTINATION` (required): The destination URL to proxy requests to
- `ISENKRAM_BIND` (optional): The address and port to bind the proxy server to (default: 127.0.0.1:3000)

## Development
- Language: Rust (2024 edition)
- Runtime: Tokio async runtime
- HTTP: Hyper framework
- Environment: dotenvy for .env file loading

## Commands
- Build: `cargo build`
- Run: `cargo run`
- Test: `cargo test`
- Check: `cargo check`
- Format: `cargo fmt`
- Lint: `cargo clippy`

## Recent Changes
- Working HTTP proxy implementation
- Added caching for GET requests
- Environment variable configuration