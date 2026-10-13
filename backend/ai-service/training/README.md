# Mess Guide — Fine-Tuning Pipeline (Unsloth)

Fine-tunes a small open model on this project's own data so the in-app "Mess Guide" assistant
learns the platform's dashboard scopes, out-of-scope refusals and tool-calling behaviour. Live
facts still come from the tools at runtime — the fine-tune teaches behaviour, not numbers.

**Tested end-to-end on:** Windows 11, RTX 3050 Laptop (6 GB VRAM), Smart App Control ON.
The working model is `Qwen/Qwen2.5-1.5B-Instruct` served through Ollama.

> 6 GB VRAM → use the **1.5B** model. A 3B model needs a bigger GPU (and swap `--model`).

## 1. Environment
Keep training deps out of the serving env — `torch`/`unsloth` are heavy.

```bash
cd backend/ai-service/training
python -m venv .venv
.venv\Scripts\activate            # Windows  (source .venv/bin/activate on Linux/macOS)
```

Install Unsloth first, then pin the CUDA stack:

```bash
pip install numpy unsloth

# Install torch with CUDA (the cu121 index carries the releases built for CUDA 12.1):
pip install torch==2.5.1 --index-url https://download.pytorch.org/whl/cu121
pip install --force-reinstall --no-deps --no-cache-dir \
    --index-url https://download.pytorch.org/whl/cu121 torchvision==0.20.1
pip uninstall -y torchao
```

**Why the pins?** `pip install unsloth` pulls a much newer torch (2.14.x) whose `c10.dll` is
blocked by **Smart App Control** on Windows. torch 2.5.1 loads fine. Unsloth then needs a
matching `torchvision` (0.20.1) and a matching stack — `torchao` is dropped because it requires
`torch.int1`, which 2.5.1 doesn't have. On a machine without Smart App Control you can usually
skip the pins and just `pip install unsloth`.

Verify CUDA before training:
```bash
python -c "import torch; print(torch.__version__, torch.cuda.is_available())"
```
Expect `2.5.1+cu121 True`.

## 2. Build the dataset
Regenerate whenever docs, routes, scopes or the tool schema change.

```bash
python build_dataset.py
```

Generates a **dashboard-scoped** dataset: for every scope it emits curated Q/A, scoped
out-of-scope refusals, and tool-call examples restricted to that dashboard's tools. The system
prompt per sample is the same one the runtime builds (`tools.contract_system_prompt(scope)`), so
training and serving never drift apart. Writes `data/guide_train.jsonl` and `data/guide_eval.jsonl`.

Current size: ~245 samples across all 9 dashboards (Student 44, Mess 41, Admin 37, Home 29,
Principal 27, KFC 19, Block Coordinator 18, Room Lead 15, Floor Incharge 15). Grow it by adding
phrasings to `GUIDES` / `EXTRA_TOOL_CALLS` in `build_dataset.py`.

## 3. Train
```bash
set HF_HUB_DISABLE_XET=1           # Windows; avoids a stalled HF transfer backend
python train_unsloth.py --model Qwen/Qwen2.5-1.5B-Instruct --epochs 2 \
    --batch-size 1 --grad-accum 8 --max-seq-length 2048
```
Runs in ~5 minutes on a 6 GB GPU. Output: `outputs/lora` (LoRA adapter + tokenizer).

## 4. Export a GGUF for Ollama
Ollama needs GGUF. On Windows its `--experimental` safetensors import produces an **MLX-only**
model that cannot run, so merge + convert explicitly:

```bash
pip install gguf sentencepiece
python merge_adapter.py --adapter outputs/lora --out outputs/merged      # 16-bit safetensors

git clone --depth 1 https://github.com/ggerganov/llama.cpp outputs/llama.cpp
python outputs/llama.cpp/convert_hf_to_gguf.py outputs/merged \
    --outfile outputs/mess-guide-f16.gguf --outtype f16
```

Then register it with Ollama (a `Modelfile` containing just the GGUF path):
```
FROM D:/Smart_Mess_Kiet/backend/ai-service/training/outputs/mess-guide-f16.gguf
```
```bash
ollama create mess-guide -f Modelfile
```

> The GGUF must fit on the drive holding `~/.ollama/models` (usually **C:**). Clear room with
> `pip cache purge` if it reports "not enough space on the disk".

`export_gguf.py` (Unsloth's `save_pretrained_gguf`) is an alternative, but it builds llama.cpp
locally, which is fragile on Windows.

## 5. Serve

The service defaults to the **Ollama** backend (`LLM_BACKEND=ollama`), which uses native
tool-calling — far more reliable for small models than coaxing JSON out of them.

```bash
ollama serve                         # if not already running via the desktop app
cd backend/ai-service
pip install fastapi uvicorn pydantic
set OLLAMA_MODEL=mess-guide          # use the fine-tuned model
uvicorn main:app --port 8000 --reload
```

Config (env vars): `LLM_BACKEND` (`ollama` | `llamacpp`), `OLLAMA_URL`
(default `http://127.0.0.1:11434`), `OLLAMA_MODEL` (default `llama3.2:latest`).
`OLLAMA_MODEL=mess-guide` also matches `mess-guide:latest`.

**llama.cpp backend** — set `LLM_BACKEND=llamacpp` to load a GGUF directly via
`llama-cpp-python` using the fine-tuned JSON contract (no Ollama needed). Note Smart App Control
may block its native DLL on this machine.

The model service is optional: the guide widget shows a friendly "unavailable" message when the
backend or model is missing, and the rest of the platform is unaffected.

## Regenerating after changes
1. Edit `tools_schema.json` and/or the guide seeds in `build_dataset.py`.
2. `python build_dataset.py`
3. `python train_unsloth.py ...`
4. `python merge_adapter.py` then the `convert_hf_to_gguf.py` step
5. `ollama create mess-guide -f Modelfile` (recreate to pick up the new GGUF)
6. `python ../build_index.py` (only if repo docs changed; optional RAG)
