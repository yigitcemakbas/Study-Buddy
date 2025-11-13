# Simple Command-Line Study Tool
A fast and straightforward command-line study tool built in Rust to help with memorization. Instead of requiring exact text matches, it uses a custom trained AI model to check if your answer is semantically correct.

## Setup
**Requirements:**
- Rust installed
- ~30 MB disk space for AI model

**Install:**
```bash
git clone https://github.com/yigitcemakbas/Simple-Study-Tool.git
cd Simple-Study-Tool
cargo build --release
```

## Usage

```bash
cargo run
```
1. Enter question-answer pairs.
2. Type 'done' to start quiz.
3. Answer questions (AI checks semantic correctness).
4. Type 'quit' to exit.

## How it works
The program uses a custom-trained siamese transformer model (ONNX format) that:

1. Tokenizes both the correct answer and user's answer
2. Encodes them into semantic embeddings
3. Computes cosine similarity between embeddings
4. Accepts answers above 75% similarity threshold
5. The model automatically downloads from GitHub Releases on first run (~25 MB).

If the AI model fails to load, the program falls back to exact string matching.

## Model Details
- Architecture: Siamese Transformer (BERT-based)
- Training: Custom-trained on semantic similarity datasets
- Format: ONNX for cross-platform compatibility
- Size: ~25 MB (model + tokenizer config)
- Inference: CPU-optimized, ~5-20ms per check

## Dependencies

- `ort` - ONNX Runtime for Rust
- `ndarray` - N-dimensional arrays for tensor operations
- `rand` - random question selection
- `reqwest` - HTTP requests
- `serde/serde_json` - JSON handling and configuration parsing

## License

MIT
