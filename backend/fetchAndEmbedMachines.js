// backend/fetchAndEmbedMachines.js
import fs from 'fs';
import dotenv from 'dotenv';
import OpenAI from 'openai';

dotenv.config();
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// Load machine listings from machines.json
const machines = JSON.parse(fs.readFileSync('./machines.json', 'utf-8'));

async function createMachineEmbeddings() {
  const vectorStore = [];

  for (const machine of machines) {
    const content = `
      Title: ${machine.title}
      Make: ${machine.make}
      Model: ${machine.model}
      Year: ${machine.year}
      Price: ${machine.price || 'Call for Price'}
      Location: ${machine.location}
      Description: ${machine.description || ''}
    `.trim();

    const embedding = await openai.embeddings.create({
      model: 'text-embedding-3-small',
      input: content
    });

    vectorStore.push({
      id: machine.id || machine.title,
      content,
      embedding: embedding.data[0].embedding
    });

    console.log(`✅ Embedded: ${machine.title}`);
  }

  fs.writeFileSync('./vectorStore_machines.json', JSON.stringify(vectorStore, null, 2));
  console.log('📦 Finished embedding machines to vectorStore_machines.json');
}

createMachineEmbeddings().catch(console.error);
