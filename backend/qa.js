// backend/qa.js
import fs from 'fs';
import dotenv from 'dotenv';
import { OpenAI } from 'openai';
import cosineSimilarity from 'compute-cosine-similarity';

dotenv.config();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Load all vector stores
const store1 = JSON.parse(fs.readFileSync('./vectorStore.json', 'utf-8'));
const store2 = JSON.parse(fs.readFileSync('./vectorStore_pages.json', 'utf-8'));
const store3 = JSON.parse(fs.readFileSync('./vectorStore_machines.json', 'utf-8'));

const vectorStore = [...store1, ...store2, ...store3];

export async function answerQuestion(question) {
  // Step 1: Embed the user's question
  const embedRes = await openai.embeddings.create({
    model: 'text-embedding-ada-002',
    input: question
  });
  const inputEmbedding = embedRes.data[0].embedding;

  // Step 2: Rank all embeddings by cosine similarity
  const ranked = vectorStore
    .map(item => ({
      ...item,
      score: cosineSimilarity(item.embedding, inputEmbedding)
    }))
    .sort((a, b) => b.score - a.score)
    .slice(0, 5); // top 5 matches for better context

  const context = ranked.map(r => `• ${r.content}`).join('\n');

  // Step 3: Ask GPT to answer using top context
  const gptRes = await openai.chat.completions.create({
    model: 'gpt-4',
    messages: [
      {
        role: 'system',
        content: 'You are a helpful assistant for Forestry Equipment Sales. Use the listings and information below to answer the customer’s question clearly and directly.'
      },
      {
        role: 'user',
        content: `User question: "${question}"\n\nRelevant data:\n${context}`
      }
    ]
  });

  return gptRes.choices[0].message.content;
}
