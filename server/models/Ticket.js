import mongoose from 'mongoose';

const ticketSchema = new mongoose.Schema({
  customerName: { type: String, default: '' },
  subject: { type: String, required: true },
  description: { type: String, required: true },
  category: {
    type: String,
    enum: ['Billing', 'Technical Issue', 'Account', 'Feature Request', 'General'],
    required: true,
  },
  priority: {
    type: String,
    enum: ['Low', 'Medium', 'High', 'Urgent'],
    required: true,
  },
  priorityReason: String,
  sentiment: {
    type: String,
    enum: ['Calm', 'Frustrated', 'Angry'],
    required: true,
  },
  confidence: { type: Number, min: 0, max: 100 },
  lowConfidence: Boolean,
  nextAction: String,
  suggestedResponse: String,
  createdAt: { type: Date, default: Date.now },
});

const Ticket = mongoose.models.Ticket || mongoose.model('Ticket', ticketSchema);

export default Ticket;
