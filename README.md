# Simple Command-Line Study Tool
A command-line study tool built in Rust to help with memorization. Instead of requiring exact text matches, it uses Groq's Llama AI model to check if your answer is semantically correct.

## Setup
**Requirements:**
- Rust installed
- Groq API key (free at console.groq.com)

**Install:**
```bash
git clone https://github.com/yigitcemakbas/studytool.git
cd studytool
echo "GROQ_API_KEY=your_key_here" > .env
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
The program sends the user's answer and the original correct answer to Groq's API as parameters, which then determines if they mean the same thing. If the API call fails the program falls back to exact character-by-character matching.
The questions are given to the user in a random order to better aid with memorization.

## Dependencies

- `rand` - random question selection
- `reqwest` - HTTP requests
- `serde/serde_json` - JSON handling
- `dotenv` - environment variables

## Security

API key stored in `.env` (gitignored). Don't commit your `.env` file.

## License

MIT
