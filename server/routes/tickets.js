import { Router } from 'express';
import mongoose from 'mongoose';
import { classifyTicket } from '../services/aiService.js';
import { getAssignedAgent } from '../services/assignmentService.js';
import { sanitizeSensitiveData } from '../services/sensitiveDataService.js';
import Ticket from '../models/Ticket.js';

const router = Router();
const MAX_SUBJECT_LENGTH = 200;
const MAX_DESCRIPTION_LENGTH = 5000;
const MAX_CUSTOMER_NAME_LENGTH = 120;

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
    assignedAgent: ticket.assignedAgent,
    assignedTeam: ticket.assignedTeam,
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

  if (
    subject.trim().length > MAX_SUBJECT_LENGTH ||
    description.trim().length > MAX_DESCRIPTION_LENGTH ||
    (typeof customerName === 'string' && customerName.trim().length > MAX_CUSTOMER_NAME_LENGTH)
  ) {
    return res.status(400).json({
      error: `Subject must be ${MAX_SUBJECT_LENGTH} characters or fewer, description must be ${MAX_DESCRIPTION_LENGTH} characters or fewer, and customer name must be ${MAX_CUSTOMER_NAME_LENGTH} characters or fewer.`,
    });
  }

  const sanitizedSubject = sanitizeSensitiveData(subject.trim());
  const sanitizedDescription = sanitizeSensitiveData(description.trim());
  const detectedSensitiveTypes = [
    ...sanitizedSubject.detectedTypes,
    ...sanitizedDescription.detectedTypes,
  ];

  if (detectedSensitiveTypes.length > 0) {
    console.warn('Sensitive data redacted from ticket:', [...new Set(detectedSensitiveTypes)].join(', '));
  }

  let classification;
  try {
    classification = await classifyTicket(
      sanitizedSubject.sanitizedText,
      sanitizedDescription.sanitizedText,
    );
  } catch (error) {
    console.error('Ticket classification failed:', error.message);
    return res.status(502).json({ error: 'Unable to analyze the ticket right now. Please try again.' });
  }

  try {
    const { agentName, team } = getAssignedAgent(classification.category);
    const savedTicket = await Ticket.create({
      customerName: typeof customerName === 'string' ? customerName.trim() : '',
      subject: sanitizedSubject.sanitizedText,
      description: sanitizedDescription.sanitizedText,
      ...classification,
      assignedAgent: agentName,
      assignedTeam: team,
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
