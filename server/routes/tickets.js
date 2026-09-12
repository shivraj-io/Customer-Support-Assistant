import { Router } from 'express';
import { randomUUID } from 'node:crypto';
import { classifyTicket } from '../services/aiService.js';
import { addTicket, getAllTickets } from '../store.js';

const router = Router();

router.post('/', async (req, res) => {
  const { customerName = '', subject, description } = req.body ?? {};

  if (typeof subject !== 'string' || !subject.trim() || typeof description !== 'string' || !description.trim()) {
    return res.status(400).json({ error: 'Subject and description are required.' });
  }

  try {
    const classification = await classifyTicket(subject.trim(), description.trim());
    const ticket = {
      id: randomUUID(),
      customerName: typeof customerName === 'string' ? customerName.trim() : '',
      subject: subject.trim(),
      description: description.trim(),
      ...classification,
      createdAt: new Date().toISOString(),
    };

    const savedTicket = await addTicket(ticket);
    return res.status(200).json(savedTicket);
  } catch (error) {
    console.error('Ticket classification failed:', error.message);
    return res.status(502).json({ error: 'Unable to analyze the ticket right now. Please try again.' });
  }
});

router.get('/', async (req, res) => {
  try {
    const tickets = await getAllTickets();
    return res.status(200).json(tickets);
  } catch (error) {
    console.error('Ticket history lookup failed:', error.message);
    return res.status(500).json({ error: 'Unable to load ticket history right now.' });
  }
});

export default router;
