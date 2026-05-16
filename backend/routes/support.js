import express from 'express';
import { GoogleGenAI } from '@google/genai';
import { supabase } from '../lib/supabase.js';
import db from '../db.js';
import { authGuard, roleGuard } from '../middleware/auth.js';
import { success, error } from '../utils/response.js';

const router = express.Router();

const ai = new GoogleGenAI(process.env.GEMINI_API_KEY || '');

const SUPPORT_SYSTEM_PROMPT = `You are the Official AI Support Specialist for GOLO PRIVE, a luxury e-commerce house.
Your goal is to provide immediate, high-end support to our distinguished clients while adhering to our terms and policies.

POLICIES:
1. Returns: 7-day free returns for all authentic products. Items must be in original condition.
2. Delivery: Free delivery on orders over ৳2000. Standard delivery takes 3-5 business days.
3. Authenticity: We guarantee 100% authenticity for all luxury items.
4. Privacy: We protect client data with utmost confidentiality.
5. Problems: If a client reports a serious issue (damaged item, missing order), acknowledge it professionally and inform them that an admin has been notified and will review the case.

BEHAVIOR:
- Warm, professional, and sophisticated tone.
- Be concise but helpful.
- For technical issues or complex order disputes, provide a helpful initial response but always state that a human administrator is also being notified for a final resolution.
- Always sign off as "GOLO PRIVE Support AI".

When a user sends a message, analyze their situation and provide the best possible solution according to these policies.`;

// User Routes
router.use(authGuard);

// Get my active ticket or create one
router.get('/my-ticket', (req, res) => {
  try {
    let ticket = db.prepare('SELECT * FROM support_tickets WHERE user_id = ? AND status != "closed" ORDER BY created_at DESC LIMIT 1').get(req.user.id);

    if (!ticket) {
      const result = db.prepare('INSERT INTO support_tickets (user_id, status) VALUES (?, ?)').run(req.user.id, 'open');
      ticket = db.prepare('SELECT * FROM support_tickets WHERE id = ?').get(result.lastInsertRowid);
    }

    const messages = db.prepare('SELECT * FROM support_messages WHERE ticket_id = ? ORDER BY created_at ASC').all(ticket.id);

    success(res, 'Ticket fetched', { ticket, messages });
  } catch (err) {
    error(res, err.message);
  }
});

// Post a message
router.post('/message', async (req, res) => {
  const { ticketId, message } = req.body;
  if (!message || !ticketId) return error(res, 'Message and ticketId are required', 400);

  try {
    // 1. Save user message
    db.prepare('INSERT INTO support_messages (ticket_id, sender_id, role, message) VALUES (?, ?, ?, ?)').run(
        ticketId, req.user.id, 'user', message
    );

    // 2. Fetch history for AI context
    const history = db.prepare('SELECT role, message FROM support_messages WHERE ticket_id = ? ORDER BY created_at ASC LIMIT 15').all(ticketId);

    // 3. Generate AI Response
    const contents = history.map(h => ({
      role: h.role === 'user' ? 'user' : 'model',
      parts: [{ text: h.message }]
    }));

    const model = ai.getGenerativeModel({ model: 'gemini-1.5-flash' });
    const result = await model.generateContent({
      contents: contents,
      systemInstruction: SUPPORT_SYSTEM_PROMPT
    });

    const aiResponse = result.response.text();

    // 4. Save AI response
    db.prepare('INSERT INTO support_messages (ticket_id, role, message) VALUES (?, ?, ?)').run(
        ticketId, 'ai', aiResponse
    );

    // 5. Update ticket
    db.prepare('UPDATE support_tickets SET last_message_at = CURRENT_TIMESTAMP WHERE id = ?').run(ticketId);
    
    success(res, 'Message processed', { aiResponse });
  } catch (err) {
    console.error('Support Engine Error:', err);
    error(res, 'Support engine temporarily offline. An admin will be notified.');
  }
});

// Admin Routes (Messenger UI)
router.get('/admin/tickets', roleGuard('admin'), async (req, res) => {
  try {
    const tickets = db.prepare('SELECT * FROM support_tickets ORDER BY last_message_at DESC').all();
    
    // Fetch user details from Supabase since users aren't in SQLite
    const userIds = [...new Set(tickets.map(t => t.user_id))];
    const { data: users } = await supabase.from('users').select('id, full_name, email, avatar_url').in('id', userIds);
    
    const userMap = (users || []).reduce((acc, u) => ({ ...acc, [u.id]: u }), {});
    
    const augmentedTickets = tickets.map(t => ({
        ...t,
        users: userMap[t.user_id] || { full_name: 'Unknown Client' }
    }));

    success(res, 'All support tickets fetched', { tickets: augmentedTickets });
  } catch (err) {
    error(res, err.message);
  }
});

router.get('/admin/tickets/:id', roleGuard('admin'), (req, res) => {
  try {
    const messages = db.prepare('SELECT * FROM support_messages WHERE ticket_id = ? ORDER BY created_at ASC').all(req.params.id);
    success(res, 'Ticket messages fetched', { messages });
  } catch (err) {
    error(res, err.message);
  }
});

router.post('/admin/reply', roleGuard('admin'), (req, res) => {
  const { ticketId, message } = req.body;
  try {
    db.prepare('INSERT INTO support_messages (ticket_id, sender_id, role, message) VALUES (?, ?, ?, ?)').run(
        ticketId, req.user.id, 'admin', message
    );
    db.prepare('UPDATE support_tickets SET status = "pending" WHERE id = ?').run(ticketId);
    success(res, 'Reply sent');
  } catch (err) {
    error(res, err.message);
  }
});

router.patch('/admin/tickets/:id/status', roleGuard('admin'), (req, res) => {
  const { status } = req.body;
  try {
    db.prepare('UPDATE support_tickets SET status = ? WHERE id = ?').run(status, req.params.id);
    success(res, 'Ticket status updated');
  } catch (err) {
    error(res, err.message);
  }
});

export default router;
