FROM python:3.11-slim

ENV PYTHONUNBUFFERED=1 \
    PIP_NO_CACHE_DIR=1 \
    PORT=8000 \
    # llama-cpp-python builds from source; keep the build portable across hosts.
    CMAKE_ARGS="-DGGML_NATIVE=OFF"

# Build tools for llama-cpp-python, plus curl for optional model downloads.
RUN apt-get update && apt-get install -y --no-install-recommends \
        build-essential cmake curl \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# CPU-only PyTorch. Installing it first stops sentence-transformers from pulling
# the multi-GB CUDA wheels, which would not fit Render's build/runtime limits.
RUN pip install --upgrade pip \
    && pip install torch --index-url https://download.pytorch.org/whl/cpu

COPY requirements.txt .
RUN pip install -r requirements.txt

COPY . .

# Optional: bake the ~1.1 GB GGUF into the image at build time.
# Set the MODEL_URL build arg to a direct download link, e.g.
#   docker build --build-arg MODEL_URL=https://.../qwen2.5-1.5b-instruct-q4_k_m.gguf .
# Otherwise mount a Render Disk at /app/models holding the .gguf file.
ARG MODEL_URL=""
RUN if [ -n "$MODEL_URL" ]; then \
        mkdir -p models && curl -L "$MODEL_URL" -o models/qwen2.5-1.5b-instruct-q4_k_m.gguf; \
    fi

EXPOSE 8000
CMD ["sh", "-c", "uvicorn main:app --host 0.0.0.0 --port ${PORT:-8000}"]
