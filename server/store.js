import mongoose from 'mongoose';

const ticketSchema = new mongoose.Schema(
  {
    id: { type: String, required: true, unique: true },
    customerName: { type: String, default: '' },
    subject: { type: String, required: true },
    description: { type: String, required: true },
    category: { type: String, required: true },
    priority: { type: String, required: true },
    priorityReason: { type: String, required: true },
    sentiment: { type: String, required: true },
    confidence: { type: Number, required: true },
    nextAction: { type: String, required: true },
    suggestedResponse: { type: String, required: true },
    createdAt: { type: Date, required: true },
    lowConfidence: { type: Boolean, required: true },
  },
  { versionKey: false },
);

const Ticket = mongoose.models.Ticket || mongoose.model('Ticket', ticketSchema);

const publicFields = [
  'id',
  'customerName',
  'subject',
  'description',
  'category',
  'priority',
  'priorityReason',
  'sentiment',
  'confidence',
  'nextAction',
  'suggestedResponse',
  'createdAt',
  'lowConfidence',
];

function toPublicTicket(ticket) {
  return Object.fromEntries(publicFields.map((field) => [field, ticket[field]]));
}

export async function connectStore() {
  const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/ticket-assistant';
  await mongoose.connect(mongoUri);
  console.log('Connected to MongoDB');
}

export async function addTicket(ticket) {
  const savedTicket = await Ticket.create(ticket);
  return toPublicTicket(savedTicket.toObject());
}

export async function getAllTickets() {
  const savedTickets = await Ticket.find().sort({ createdAt: -1 }).lean();
  return savedTickets.map(toPublicTicket);
}
