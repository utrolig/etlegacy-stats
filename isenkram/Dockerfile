# Build stage
FROM rust:1.88-slim AS builder

WORKDIR /app

# Copy manifests
COPY Cargo.toml Cargo.lock ./

# Copy source code
COPY src ./src

# Build for release
RUN cargo build --release

# Runtime stage
FROM debian:bookworm-slim

# Install ca-certificates and dumb-init for signal handling
RUN apt-get update && apt-get install -y \
    ca-certificates \
    dumb-init \
    && rm -rf /var/lib/apt/lists/*

# Create non-root user
RUN useradd -r -s /bin/false isenkram

# Copy the binary from builder stage
COPY --from=builder /app/target/release/isenkram /usr/local/bin/isenkram

# Change ownership to non-root user
RUN chown isenkram:isenkram /usr/local/bin/isenkram

# Switch to non-root user
USER isenkram

# Expose the default port
EXPOSE 3000

# Set default bind address for container
ENV ISENKRAM_BIND=0.0.0.0:3000

# Run the binary with dumb-init
ENTRYPOINT ["dumb-init", "--"]
CMD ["isenkram"]
