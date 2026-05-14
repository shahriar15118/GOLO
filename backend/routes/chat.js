import express from 'express';
import { GoogleGenAI } from '@google/genai';
import db from '../db.js';
import { success, error } from '../utils/response.js';

const router = express.Router();

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    }
  }
});

const SYSTEM_PROMPT = `You are GOLO's friendly customer service assistant for a luxury fashion e-commerce store. 
Help customers with: product recommendations, order tracking, returns policy, size guidance, and general shopping questions. 
Be warm, professional, and use luxury brand tone. 
Store details: GOLO sells clothing, jewelry, bags, gadgets, home items, kids items, luxury products, and perfumes. 
Free delivery on orders over ৳2000. 7-day free returns. All products are authentic. 
Keep responses concise and helpful.`;

router.post('/message', async (req, res) => {
  const { sessionId, message, userId } = req.body;
  if (!message || !sessionId) return error(res, 'Message and sessionId are required', 400);

  try {
    // Save user message
    db.prepare('INSERT INTO chat_messages (session_id, user_id, role, message) VALUES (?, ?, ?, ?)')
      .run(sessionId, userId || null, 'user', message);

    // Get history
    const history = db.prepare('SELECT role, message FROM chat_messages WHERE session_id = ? ORDER BY created_at ASC LIMIT 10')
      .all(sessionId);

    // Call Gemini
    const contents = history.map(h => ({
      role: h.role === 'user' ? 'user' : 'model',
      parts: [{ text: h.message }]
    }));

    // If history is empty, the first message is the current one (already saved to DB and thus in history)
    // Wait, history includes the message just saved.

    const result = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: contents,
      config: {
        systemInstruction: SYSTEM_PROMPT,
      }
    });

    const responseText = result.text;

    // Save assistant message
    db.prepare('INSERT INTO chat_messages (session_id, user_id, role, message) VALUES (?, ?, ?, ?)')
      .run(sessionId, userId || null, 'assistant', responseText);

    success(res, 'Message sent', { response: responseText });
  } catch (err) {
    console.error('Chat error:', err);
    error(res, 'Failed to get AI response');
  }
});

router.get('/history/:sessionId', (req, res) => {
  try {
    const history = db.prepare('SELECT * FROM chat_messages WHERE session_id = ? ORDER BY created_at ASC').all(req.params.sessionId);
    success(res, 'Chat history fetched', { history });
  } catch (err) {
    error(res, err.message);
  }
});

export default router;
