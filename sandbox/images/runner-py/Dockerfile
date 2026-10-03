FROM python:3.12-slim

# Install system dependencies required for building and sandboxing
RUN apt-get update && apt-get install -y \
    git \
    build-essential \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Create non-root user
RUN groupadd -g 10001 ratchet && \
    useradd -u 10001 -g ratchet -m ratchet

# Install Python testing and coverage tooling
RUN pip install --no-cache-dir \
    pytest \
    pytest-asyncio \
    coverage \
    uv

# Setup working directories
RUN mkdir -p /work /out && \
    chown -R ratchet:ratchet /work /out

USER ratchet
WORKDIR /work
