// index.js
const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const cosineSimilarity = require('compute-cosine-similarity');
const { OpenAI } = require('openai');
require('dotenv').config();

const app = express();
app.use(bodyParser.json());

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const vectorStore = JSON.parse(fs.readFileSync('./vectorStore.json', 'utf-8'));

app.post('/chat', async (req, res) => {
  const { message } = req.body;

  // Step 1: Create embedding for user message
  const embedRes = await openai.embeddings.create({
    model: 'text-embedding-ada-002',
    input: message
  });
  const inputEmbedding = embedRes.data[0].embedding;

  // Step 2: Find best-matching listing
  const ranked = vectorStore
    .map(item => ({
      ...item,
      score: cosineSimilarity(item.embedding, inputEmbedding)
    }))
    .sort((a, b) => b.score - a.score)
    .slice(0, 3); // top 3 matches

  const context = ranked.map(r => `• ${r.content}`).join('\n');

  // Step 3: Ask GPT to reply using context
  const gptRes = await openai.chat.completions.create({
    model: 'gpt-4',
    messages: [
      {
        role: 'system',
        content: 'You are a helpful forestry equipment assistant. Use the listings below to answer the user’s question clearly and directly.'
      },
      {
        role: 'user',
        content: `User question: "${message}"\n\nRelevant listings:\n${context}`
      }
    ]
  });

  res.json({ response: gptRes.choices[0].message.content });
});

app.listen(3001, () => console.log('✅ Chatbot backend running on http://localhost:3001'));
