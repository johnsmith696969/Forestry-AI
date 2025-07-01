// backend/qa.js
import fs from 'fs';
import dotenv from 'dotenv';
import OpenAI from 'openai';
import cosineSimilarity from 'cosine-similarity';

dotenv.config();
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// Load embedded website data
const vectorStore = JSON.parse(fs.readFileSync('./vectorStore_pages.json', 'utf-8'));

// Embed user question
async function getQuestionEmbedding(question) {
  const res = await openai.embeddings.create({
    model: 'text-embedding-3-small',
    input: question
  });

  return res.data[0].embedding;
}

// Find top matching chunk from your site
function findBestMatch(questionEmbedding) {
  let bestScore = -1;
  let bestMatch = null;

  for (const item of vectorStore) {
    const score = cosineSimilarity(questionEmbedding, item.embedding);
    if (score > bestScore) {
      bestScore = score;
      bestMatch = item;
    }
  }

  return bestMatch;
}

// Ask your custom AI about your site
async function askSiteBot(question) {
  const questionEmbedding = await getQuestionEmbedding(question);
  const bestMatch = findBestMatch(questionEmbedding);

  const context = bestMatch.content;

  const chat = await openai.chat.completions.create({
    model: 'gpt-4',
    messages: [
      { role: 'system', content: 'You are a helpful assistant for a heavy equipment website. Answer the question using the provided context from the site.' },
      { role: 'user', content: `Context: ${context}\n\nQuestion: ${question}` }
    ]
  });

  console.log(`💬 Q: ${question}\n🧠 A: ${chat.choices[0].message.content}`);
}

// Run with: node qa.js "YOUR QUESTION"
const userQuestion = process.argv.slice(2).join(' ');
askSiteBot(userQuestion);
