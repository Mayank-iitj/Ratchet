FROM node:22-slim

# Install system dependencies
RUN apt-get update && apt-get install -y \
    git \
    build-essential \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Create non-root user
RUN groupadd -g 10001 ratchet && \
    useradd -u 10001 -g ratchet -m ratchet

# Enable pnpm and yarn
RUN corepack enable

# Setup working directories
RUN mkdir -p /work /out && \
    chown -R ratchet:ratchet /work /out

USER ratchet
WORKDIR /work
