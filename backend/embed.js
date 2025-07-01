// embed.js
const fs = require('fs');
const { OpenAI } = require('openai');
require('dotenv').config();

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

async function createEmbeddings() {
  const machines = JSON.parse(fs.readFileSync('./machines.json', 'utf-8'));
  const vectorStore = [];

  for (const machine of machines) {
    const input = `${machine.title}. ${machine.description}. Price: $${machine.price || 'unknown'}. Location: ${machine.location}`;
    const response = await openai.embeddings.create({
      model: 'text-embedding-ada-002',
      input
    });

    vectorStore.push({
      id: machine.id,
      embedding: response.data[0].embedding,
      content: input
    });

    console.log(`Embedded: ${machine.title}`);
  }

  fs.writeFileSync('./vectorStore.json', JSON.stringify(vectorStore, null, 2));
  console.log('✅ Embedding complete. Saved to vectorStore.json');
}

createEmbeddings();
