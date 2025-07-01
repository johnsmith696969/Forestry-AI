// backend/fetchAndEmbed.js
import fetch from 'node-fetch';
import * as cheerio from 'cheerio';
import fs from 'fs';
import dotenv from 'dotenv';
import OpenAI from 'openai';

dotenv.config();

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const urls = [
  'https://forestry-equipment-sales.directoryup.com/financing',
  'https://forestry-equipment-sales.directoryup.com/insurance',
  'https://forestry-equipment-sales.directoryup.com/truck-transport-services',
  'https://forestry-equipment-sales.directoryup.com/classifieds',
  'https://forestry-equipment-sales.directoryup.com/search_results',
  'https://forestry-equipment-sales.directoryup.com/about',
  'https://forestry-equipment-sales.directoryup.com/about/contact',
  'https://forestry-equipment-sales.directoryup.com/faq',
  'https://forestry-equipment-sales.directoryup.com/about/our-team',
  'https://forestry-equipment-sales.directoryup.com/join',
  'https://forestry-equipment-sales.directoryup.com/login?login_direct_url=/account/classifieds/newgroup',
  'https://forestry-equipment-sales.directoryup.com/equipment-specs-template',
  'https://forestry-equipment-sales.directoryup.com/login',
  'https://forestry-equipment-sales.directoryup.com/login/retrieval',
  'https://forestry-equipment-sales.directoryup.com/about/terms',
  'https://forestry-equipment-sales.directoryup.com/about/privacy',
  'https://forestry-equipment-sales.directoryup.com/about/dmca-policy',
  'https://forestry-equipment-sales.directoryup.com/about/cookie-policy'
];

async function getTextFromUrl(url) {
  const res = await fetch(url);
  const html = await res.text();
  const $ = cheerio.load(html);
  const bodyText = $('body').text();
  return bodyText.replace(/\s+/g, ' ').trim();
}

async function createEmbeddingsFromUrls() {
  const vectorStore = [];

  for (const url of urls) {
    const content = await getTextFromUrl(url);
    const embedding = await openai.embeddings.create({
      model: 'text-embedding-3-small',
      input: content
    });

    vectorStore.push({
      url,
      content,
      embedding: embedding.data[0].embedding
    });

    console.log(`✅ Embedded: ${url}`);
  }

  fs.writeFileSync('./vectorStore_pages.json', JSON.stringify(vectorStore, null, 2));
  console.log('📦 Finished embedding all URLs to vectorStore_pages.json');
}

createEmbeddingsFromUrls().catch(console.error);
