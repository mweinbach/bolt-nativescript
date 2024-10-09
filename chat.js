import fetch from 'node-fetch';
import readlineSync from 'readline-sync';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

const ENV_FILE = path.join(__dirname, '.env');

// Function to prompt user for API key and save it
function setupApiKey() {
  const apiKey = readlineSync.question('Enter your OpenRouter API key: ', {
    hideEchoBack: true
  });
  fs.writeFileSync(ENV_FILE, `OPENROUTER_API_KEY=${apiKey}\n`);
  process.env.OPENROUTER_API_KEY = apiKey;
  console.log('API key saved successfully.');
}

// Check if API key exists, if not, prompt user to enter it
if (!process.env.OPENROUTER_API_KEY) {
  setupApiKey();
}

// Function to fetch available models
async function fetchModels() {
  try {
    const response = await fetch('https://openrouter.ai/api/v1/models');
    const data = await response.json();
    return data.data;
  } catch (error) {
    console.error('Error fetching models:', error);
    return [];
  }
}

// Function to select a model
async function selectModel() {
  const models = await fetchModels();
  const choices = models.map(model => model.id);
  const index = readlineSync.keyInSelect(choices, 'Select a model:');
  return index !== -1 ? choices[index] : null;
}

// Function to chat with the selected model
async function chat(model) {
  console.log(`Chatting with ${model}. Type 'exit' to quit.`);
  
  while (true) {
    const userMessage = readlineSync.question('You: ');
    if (userMessage.toLowerCase() === 'exit') break;

    try {
      const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          "model": model,
          "messages": [
            {
              "role": "user",
              "content": userMessage
            }
          ]
        })
      });

      const data = await response.json();
      if (data.choices && data.choices.length > 0) {
        console.log('AI:', data.choices[0].message.content);
      } else {
        console.log('AI: Sorry, I couldn\'t generate a response.');
      }
    } catch (error) {
      console.error('Error:', error.message);
    }
  }
}

// Main function
async function main() {
  while (true) {
    console.log('\n1. Start chat');
    console.log('2. Change API key');
    console.log('3. Exit');
    const choice = readlineSync.question('Choose an option: ');

    switch (choice) {
      case '1':
        const selectedModel = await selectModel();
        if (selectedModel) {
          await chat(selectedModel);
        }
        break;
      case '2':
        setupApiKey();
        break;
      case '3':
        console.log('Goodbye!');
        process.exit(0);
      default:
        console.log('Invalid option. Please try again.');
    }
  }
}

main();