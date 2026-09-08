# Training — BigEarthNet Adaptation (Phase 9)

Separate from the running backend on purpose: dataset prep and training are
explicit, manual commands — nothing here runs automatically when the API
server starts.

## 1. Prepare the dataset

```bash
python training/prepare_dataset.py \
  --input /path/to/BigEarthNet \
  --output data/processed/bigearthnet_prepared.jsonl
```

`build_examples()` in `prepare_dataset.py` is a placeholder — implement the
BigEarthNet label → (instruction, response) conversion for your chosen
taxonomy before running this for real. See the docstring in that file for
the expected output shape.

## 2. Fine-tune with LoRA

```bash
python training/train_lora.py \
  --dataset data/processed/bigearthnet_prepared.jsonl \
  --base-model Salesforce/blip-image-captioning-base \
  --output models/satquery-vlm-lora \
  --epochs 3
```

Swap `--base-model` for whichever open vision-language backbone the team
selects. `target_modules` in the `LoraConfig` inside `train_lora.py` will
need to match that model's attention module names.

## 3. Evaluate

```bash
python training/evaluate.py \
  --dataset data/processed/bigearthnet_eval.jsonl \
  --checkpoint models/satquery-vlm-lora
```

## 4. Wire the checkpoint into the backend

Set in `.env`:

```
MOCK_INFERENCE=false
VLM_CHECKPOINT_PATH=models/satquery-vlm-lora
```

`app/models/vlm.py::HFVLMBackend` will load the base model and apply the
LoRA adapter from that path on first use.

## Requirements

The AI/ML section of `requirements.txt` (`torch`, `transformers`,
`datasets`, `peft`) — not needed for the default mock-inference demo
backend.
