use std::fs::{self, File};
use std::io::{self, Write, Read};
use std::path::Path;

const MODEL_URL: &str = "https://github.com/yigitcemakbas/Simple-Study-Tool/releases/download/v0.1.0/siamese_transformer.onnx";
const TOKENIZER_URL: &str = "https://github.com/yigitcemakbas/Simple-Study-Tool/releases/download/v0.1.0/tokenizer_config.json";

const MODEL_PATH: &str = "model/siamese_transformer.onnx";
const TOKENIZER_PATH: &str = "model/tokenizer_config.json";

pub struct ModelDownloader;

impl ModelDownloader {
    pub fn ensure_model_exists() -> Result<(), Box<dyn std::error::Error>> {
        fs::create_dir_all("model")?;

        let model_exists = Path::new(MODEL_PATH).exists();
        let tokenizer_exists = Path::new(TOKENIZER_PATH).exists();

        if model_exists && tokenizer_exists {
            println!("✓ Model files found");
            return Ok(());
        }

        println!("\n⚡ First-time setup: Downloading AI model...");
        
        if !model_exists {
            Self::download_file(MODEL_URL, MODEL_PATH, "Model")?;
        }

        if !tokenizer_exists {
            Self::download_file(TOKENIZER_URL, TOKENIZER_PATH, "Config")?;
        }

        println!("✅ Setup complete!\n");
        Ok(())
    }

    fn download_file(url: &str, path: &str, name: &str) -> Result<(), Box<dyn std::error::Error>> {
        print!("📥 Downloading {}... ", name);
        io::stdout().flush()?;

        let client = reqwest::blocking::Client::builder()
            .timeout(std::time::Duration::from_secs(120))
            .build()?;

        let mut response = client.get(url).send()?;

        if !response.status().is_success() {
            return Err(format!("HTTP {}", response.status()).into());
        }

        let mut file = File::create(path)?;
        let mut buffer = [0; 8192];

        loop {
            let bytes_read = response.read(&mut buffer)?;
            if bytes_read == 0 {
                break;
            }
            file.write_all(&buffer[..bytes_read])?;
        }

        println!("✓");
        Ok(())
    }

    pub fn get_model_path() -> &'static str {
        MODEL_PATH
    }

    pub fn get_tokenizer_path() -> &'static str {
        TOKENIZER_PATH
    }
}