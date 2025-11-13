mod ai_model;
mod model_downloader;

use std::io::{self,Write};
use rand::Rng;
use ai_model::SemanticChecker;


fn main() {
     
    println!("Initializing AI model...");
    let mut checker=match SemanticChecker::load(){
        Ok(checker)=>checker,
        Err(e)=>{
        eprintln!("\nFailed to load model: {}",e);
        eprintln!("\nPossible issues:");
        eprintln!("     1. No internet (needed for first-time download)");
        eprintln!("     2. GitHub is unreachable");
        eprintln!("     3. Insufficient disk space (~25MB required)\n");
        return;
        }
    };

    let mut arr = Vec::new();

    println!("\n-----------------------------------------");
    println!("\n Enter 'done' to start testing yourself.");
    println!("\n-----------------------------------------");
    


    
    // Input loop
    loop {



        let mut question = String::new();
        let mut answer = String::new();

        println!("\nEnter your question: ");
        io::stdout().flush().unwrap();
        io::stdin().read_line(&mut question).expect("Failed to read line.");

        let question = question.trim();
        if question == "done" {
            break;
        }

        if question.is_empty(){
            continue;
        }

        println!("Enter the answer: ");
        io::stdout().flush().unwrap();
        io::stdin().read_line(&mut answer).expect("Failed to read line.");
        let answer = answer.trim();
        if answer.is_empty(){
        continue;
        }

        arr.push((question.to_string(), answer.to_string()));
        println!("Added! Question count: {}", arr.len());
    }

    if arr.is_empty(){
        println!("No questions available.");
        return;
    }

    let mut rng = rand::thread_rng();

    let threshold=0.60;

    loop {
        if arr.is_empty() {
            println!("No questions available.");
            break;
        }

        let random_index = rng.gen_range(0..arr.len());
        let (question, answer) = &arr[random_index];

        println!("\n------------------------------");
        println!("Question: {}", question);

        let mut user_answer = String::new();
        println!("Your answer (or type 'quit' to exit): ");
        io::stdout().flush().unwrap();
        io::stdin().read_line(&mut user_answer).expect("Failed to read line.");

        let user_answer = user_answer.trim();
        if user_answer == "quit" {
            break;
        }


        if user_answer.is_empty(){
            continue;
        }

        println!("Checking...");
        io::stdout().flush().unwrap();

        match checker.check_similarity(answer,user_answer,threshold){
            Ok((is_correct,similarity))=>{
                let percentage=(similarity*100.0).round() as i32;

                if is_correct{
                println!("Correct! (Similarity: {}%)",percentage);
                }
                else{
                println!("Incorrect. (Similarity: {}%)",percentage);
                println!("Expected answer: {}",answer);
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