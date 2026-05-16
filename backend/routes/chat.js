import express from 'express';
import { GoogleGenAI } from '@google/genai';
import { supabase } from '../lib/supabase.js';
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
    const { error: userMsgError } = await supabase
      .from('chat_messages')
      .insert([{ 
        session_id: sessionId, 
        user_id: userId || null, 
        role: 'user', 
        message: message 
      }]);
    
    if (userMsgError) throw userMsgError;

    // Get history
    const { data: history, error: historyError } = await supabase
      .from('chat_messages')
      .select('role, message')
      .eq('session_id', sessionId)
      .order('created_at', { ascending: true })
      .limit(10);

    if (historyError) throw historyError;

    // Call Gemini
    const contents = history.map(h => ({
      role: h.role === 'user' ? 'user' : 'model',
      parts: [{ text: h.message }]
    }));

    const result = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: contents,
      config: {
        systemInstruction: SYSTEM_PROMPT,
      }
    });

    const responseText = result.text;

    // Save assistant message
    const { error: assistantMsgError } = await supabase
      .from('chat_messages')
      .insert([{ 
        session_id: sessionId, 
        user_id: userId || null, 
        role: 'model', 
        message: responseText 
      }]);

    if (assistantMsgError) throw assistantMsgError;

    success(res, 'Message sent', { response: responseText });
  } catch (err) {
    console.error('Chat error:', err);
    error(res, 'Failed to get AI response');
  }
});

router.get('/history/:sessionId', async (req, res) => {
  try {
    const { data: history, error: supabaseError } = await supabase
      .from('chat_messages')
      .select('*')
      .eq('session_id', req.params.sessionId)
      .order('created_at', { ascending: true });

    if (supabaseError) throw supabaseError;
    success(res, 'Chat history fetched', { history });
  } catch (err) {
    error(res, err.message);
  }
});

export default router;
