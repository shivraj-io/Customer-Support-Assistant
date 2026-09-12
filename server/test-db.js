import 'dotenv/config';
import mongoose from 'mongoose';
import { connectDB } from './db.js';
import Ticket from './models/Ticket.js';

await connectDB();

const savedTicket = await Ticket.create({
  customerName: 'Asha Demo',
  subject: 'Refund request for duplicate charge',
  description: 'I was charged twice for the same order and need one payment refunded.',
  category: 'Billing',
  priority: 'High',
  priorityReason: 'A duplicate charge needs billing review.',
  sentiment: 'Frustrated',
  confidence: 92,
  lowConfidence: false,
  nextAction: 'Escalate to the billing team.',
  suggestedResponse: 'Hi Asha, I am sorry about the duplicate charge. We are reviewing it now and will help process the refund.',
});

console.log('Saved ticket:');
console.log(savedTicket.toObject());

const allTickets = await Ticket.find().sort({ createdAt: -1 }).lean();
console.log('Fetched tickets:');
console.log(allTickets);

await mongoose.disconnect();
