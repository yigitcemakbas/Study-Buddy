use std::io;
use std::env;
use rand::Rng;
use serde::{Deserialize, Serialize};
use dotenv::dotenv;

#[derive(Serialize)]
struct GroqRequest {
    model: String,
    messages: Vec<Message>,
    temperature: f32,  // Changed ; to ,
}

#[derive(Serialize, Deserialize)]
struct Message {
    role: String,
    content: String,
}

#[derive(Deserialize)]
struct GroqResponse {
    choices: Vec<Choice>,
}

#[derive(Deserialize)]
struct Choice {
    message: Message,
}

fn check_answer_with_groq(client: &reqwest::blocking::Client,question: &str, answer: &str, user_answer: &str, api_key: &str) -> Result<bool, Box<dyn std::error::Error>> {
    let prompt = format!(
        "Question: {}\n\nCorrect answer: {}\n\nUser's answer: {}\n\nIs the user's answer semantically correct? Does it convey the same meaning as the correct answer, even if worded differently? Respond with ONLY 'YES' or 'NO'.",
        question, answer, user_answer
    );

    let request_body = GroqRequest {
        model: "llama-3.3-70b-versatile".to_string(),
        messages: vec![
            Message {
                role: "system".to_string(),
                content: "You are a precise grading assistant. Judge answers with extreme academic strictness. Only respond with 'YES' or 'NO'.".to_string(),
            },
            Message {
                role: "user".to_string(),
                content: prompt,
            },
        ],
        temperature: 0.1,
    };

    let response = client
        .post("https://api.groq.com/openai/v1/chat/completions")
        .header("Authorization", format!("Bearer {}", api_key))
        .header("Content-Type", "application/json")
        .json(&request_body)
        .send()?;

    let groq_response: GroqResponse = response.json()?;

    let answer = groq_response.choices
    .first()
    .ok_or("No response from API")?
    .message.content.trim().to_uppercase();

    Ok(answer.contains("YES"))
}

fn main() {
    dotenv().ok();

    let api_key = env::var("GROQ_API_KEY")
    .expect("GROQ_API_KEY must be set in .env file");

    let mut arr = Vec::new();

    println!("\n-----------------------------------------");
    println!("\n Enter 'done' to start testing yourself.");
    println!("\n-----------------------------------------");
    // Input loop
    loop {
        let mut question = String::new();
        let mut answer = String::new();

        println!("\nEnter your question: ");
        io::stdin().read_line(&mut question).expect("Failed to read line.");

        let question = question.trim();
        if question == "done" {
            break;
        }

        println!("Enter your answer: ");
        io::stdin().read_line(&mut answer).expect("Failed to read line.");
        let answer = answer.trim();

        arr.push((question.to_string(), answer.to_string()));
        println!("Added! Question count: {}", arr.len());
    }

    let client = reqwest::blocking::Client::new();

    loop {
        if arr.is_empty() {
            println!("No questions available.");
            break;
        }

        let random_index = rand::rng().random_range(0..arr.len());  // Updated method name
        let (question, answer) = &arr[random_index];

        println!("\n------------------------------");
        println!("Question: {}", question);

        let mut user_answer = String::new();
        println!("Your answer (or type 'quit' to exit): ");
        io::stdin().read_line(&mut user_answer).expect("Failed to read line.");

        let user_answer = user_answer.trim();
        if user_answer == "quit" {
            break;
        }

        println!("Checking...");
        match check_answer_with_groq(&client, question, answer, user_answer,&api_key) {
            Ok(is_correct) => {
                if is_correct {
                    println!("Correct! Your answer is semantically accurate.");
                } else {
                    println!("Incorrect. Expected answer: {}", answer);
                }
            }
            Err(e) => {
                println!("Error checking answer: {}", e);
                println!("Falling back to exact match...");
                if user_answer == answer {
                    println!("Correct!");
                } else {
                    println!("Wrong! The answer was: {}", answer);
                }
            }
        }
    }
}