import { Router } from 'express';
import mongoose from 'mongoose';
import { classifyTicket } from '../services/aiService.js';
import Ticket from '../models/Ticket.js';

const router = Router();

function toTicketResponse(ticket) {
  return {
    id: ticket._id.toString(),
    customerName: ticket.customerName,
    subject: ticket.subject,
    description: ticket.description,
    category: ticket.category,
    priority: ticket.priority,
    priorityReason: ticket.priorityReason,
    sentiment: ticket.sentiment,
    confidence: ticket.confidence,
    nextAction: ticket.nextAction,
    suggestedResponse: ticket.suggestedResponse,
    createdAt: ticket.createdAt.toISOString(),
    lowConfidence: ticket.lowConfidence,
  };
}

router.post('/', async (req, res) => {
  const { customerName = '', subject, description } = req.body ?? {};

  if (typeof subject !== 'string' || !subject.trim() || typeof description !== 'string' || !description.trim()) {
    return res.status(400).json({ error: 'Subject and description are required.' });
  }

  let classification;
  try {
    classification = await classifyTicket(subject.trim(), description.trim());
  } catch (error) {
    console.error('Ticket classification failed:', error.message);
    return res.status(502).json({ error: 'Unable to analyze the ticket right now. Please try again.' });
  }

  try {
    const savedTicket = await Ticket.create({
      customerName: typeof customerName === 'string' ? customerName.trim() : '',
      subject: subject.trim(),
      description: description.trim(),
      ...classification,
    });

    return res.status(200).json(toTicketResponse(savedTicket));
  } catch (error) {
    console.error('Ticket save failed:', error.message);
    return res.status(502).json({ error: 'Ticket was analyzed but could not be saved. Please try again.' });
  }
});

router.get('/', async (req, res) => {
  try {
    const tickets = await Ticket.find().sort({ createdAt: -1 }).lean();
    return res.status(200).json(tickets.map(toTicketResponse));
  } catch (error) {
    console.error('Ticket history lookup failed:', error.message);
    return res.status(500).json({ error: 'Unable to load ticket history right now.' });
  }
});

router.delete('/', async (req, res) => {
  const { ids } = req.body ?? {};

  if (!Array.isArray(ids) || ids.length === 0 || ids.some((id) => !mongoose.isValidObjectId(id))) {
    return res.status(400).json({ error: 'Provide one or more valid ticket ids.' });
  }

  try {
    const result = await Ticket.deleteMany({ _id: { $in: ids } });
    return res.status(200).json({ deletedCount: result.deletedCount });
  } catch (error) {
    console.error('Ticket deletion failed:', error.message);
    return res.status(500).json({ error: 'Unable to delete selected tickets right now.' });
  }
});

export default router;
