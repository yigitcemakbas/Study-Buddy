use ort::session::{Session, builder::GraphOptimizationLevel};
use ort::value::Value;
use serde::Deserialize;
use std::collections::HashMap;
use std::fs;

#[derive(Deserialize)]
struct TokenizerConfig {
    vocab: HashMap<String, i64>,
    max_length: usize,
    pad_token: String,
    unk_token: String,
    cls_token: String,
    sep_token: String,
}

pub struct SemanticChecker {
    session: Session,
    vocab: HashMap<String, i64>,
    max_length: usize,
    pad_token_id: i64,
    unk_token_id: i64,
    cls_token_id: i64,
    sep_token_id: i64,
}

impl SemanticChecker {
    fn new(model_path: &str, config_path: &str) -> Result<Self, Box<dyn std::error::Error>> {
        // Create session with ort 2.0 API
        let session = Session::builder()?
            .with_optimization_level(GraphOptimizationLevel::Level3)?
            .with_intra_threads(4)?
            .commit_from_file(model_path)?;

        let config_json = fs::read_to_string(config_path)?;
        let config: TokenizerConfig = serde_json::from_str(&config_json)?;

        let pad_token_id = *config.vocab.get(&config.pad_token).ok_or("PAD token not found")?;
        let unk_token_id = *config.vocab.get(&config.unk_token).ok_or("UNK token not found")?;
        let cls_token_id = *config.vocab.get(&config.cls_token).ok_or("CLS token not found")?;
        let sep_token_id = *config.vocab.get(&config.sep_token).ok_or("SEP token not found")?;

        println!("Model loaded (vocab: {}, max_len: {})", config.vocab.len(), config.max_length);

        Ok(Self {
            session,
            vocab: config.vocab,
            max_length: config.max_length,
            pad_token_id,
            unk_token_id,
            cls_token_id,
            sep_token_id,
        })
    }

    fn encode(&self, text: &str) -> Vec<i64> {
        let lowercase_text = text.to_lowercase();
        let words: Vec<&str> = lowercase_text.split_whitespace().collect();
        let mut tokens = vec![self.cls_token_id];

        for word in words.iter().take(self.max_length - 2) {
            let token_id = self.vocab.get(*word).copied().unwrap_or(self.unk_token_id);
            tokens.push(token_id);
        }

        tokens.push(self.sep_token_id);

        while tokens.len() < self.max_length {
            tokens.push(self.pad_token_id);
        }

        tokens.truncate(self.max_length);
        tokens
    }

    pub fn check_similarity(
        &mut self,
        correct_answer: &str,
        user_answer: &str,
        threshold: f32,
    ) -> Result<(bool, f32), Box<dyn std::error::Error>> {
        let sent1_tokens = self.encode(correct_answer);
        let sent2_tokens = self.encode(user_answer);

        // Create ndarray arrays
        let sent1_array = ndarray::Array2::from_shape_vec((1, self.max_length), sent1_tokens)?;
        let sent2_array = ndarray::Array2::from_shape_vec((1, self.max_length), sent2_tokens)?;

        // Convert to ort Value
        let sent1_value = Value::from_array(sent1_array)?;
        let sent2_value = Value::from_array(sent2_array)?;

        // Run inference - NO ? after inputs![]
        let outputs = self.session.run(ort::inputs![
            "sentence1" => sent1_value,
            "sentence2" => sent2_value
        ])?;

        // Extract similarity score
    
    let similarity_output = &outputs["similarity_score"];
    let (_shape, similarity_data) = similarity_output.try_extract_tensor::<f32>()?;
    let similarity = similarity_data[0];
    let is_correct = similarity >= threshold;
    Ok((is_correct, similarity))
    }

    pub fn load() -> Result<Self, Box<dyn std::error::Error>> {
        use crate::model_downloader::ModelDownloader;
        ModelDownloader::ensure_model_exists()?;
        Self::new(
            ModelDownloader::get_model_path(),
            ModelDownloader::get_tokenizer_path()
        )
    }
}