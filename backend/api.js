// backend/api.js
import express from 'express';
import cors from 'cors';
import { answerQuestion } from './qa.js';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

app.post('/api/chat', async (req, res) => {
  const { question } = req.body;
  if (!question) return res.status(400).json({ error: 'Missing question' });

  try {
    const answer = await answerQuestion(question);
    res.json({ answer });
  } catch (err) {
    console.error('❌ Error:', err.message);
    res.status(500).json({ error: 'Failed to generate answer' });
  }
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`✅ Chatbot API server running at http://localhost:${PORT}`);
});
