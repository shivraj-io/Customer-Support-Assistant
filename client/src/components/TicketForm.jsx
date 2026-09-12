import { useState } from 'react';
import { submitTicket } from '../api.js';
import { sampleTickets } from '../sampleTickets.js';

const emptyTicket = { customerName: '', subject: '', description: '' };

function validateTicket(ticket) {
  if (!ticket.subject.trim()) return 'Please enter a subject.';
  if (!ticket.description.trim()) return 'Please enter a description.';
  return '';
}

function TicketForm({ onSubmitted, onTicketChange }) {
  const [ticket, setTicket] = useState(emptyTicket);
  const [selectedSample, setSelectedSample] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  function updateField(event) {
    const { name, value } = event.target;
    setTicket((currentTicket) => ({ ...currentTicket, [name]: value }));
    onTicketChange();
    if (error) setError('');
  }

  function selectSample(event) {
    const sample = sampleTickets.find((item) => item.id === event.target.value);
    setSelectedSample(event.target.value);
    onTicketChange();
    setError('');
    setTicket(sample ? { customerName: sample.customerName, subject: sample.subject, description: sample.description } : emptyTicket);
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError('');

    const validationError = validateTicket(ticket);
    if (validationError) {
      setError(validationError);
      return;
    }

    setIsSubmitting(true);
    try {
      const rawResponse = await submitTicket(ticket);
      console.log('Raw ticket response:', rawResponse);
      onSubmitted(rawResponse);
      setTicket(emptyTicket);
      setSelectedSample('');
    } catch (submissionError) {
      setError(submissionError.message);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form className="ticket-form" onSubmit={handleSubmit}>
      <label className="sample-picker">
        <span>Try a sample ticket</span>
        <select value={selectedSample} onChange={selectSample}>
          <option value="">Choose a seeded example…</option>
          {sampleTickets.map((sample) => <option key={sample.id} value={sample.id}>{sample.label}</option>)}
        </select>
      </label>
      <div className="field-grid">
        <label>
          <span>Customer name <em>Optional</em></span>
          <input name="customerName" value={ticket.customerName} onChange={updateField} placeholder="e.g. Alex Morgan" maxLength="120" />
        </label>
        <label>
          <span>Subject</span>
          <input name="subject" value={ticket.subject} onChange={updateField} placeholder="What is the issue about?" maxLength="200" required aria-invalid={Boolean(error && !ticket.subject.trim())} />
        </label>
      </div>
      <label>
        <span>Description</span>
        <textarea name="description" value={ticket.description} onChange={updateField} placeholder="Describe the customer's issue or request…" maxLength="5000" rows="7" required />
      </label>
      {error && <p className="error-message" role="alert">{error}</p>}
      <button className="submit-button" type="submit" disabled={isSubmitting}>
        {isSubmitting && <span className="spinner" aria-hidden="true" />}
        {isSubmitting ? 'Analyzing…' : 'Analyze Ticket'}
        {!isSubmitting && <span aria-hidden="true">→</span>}
      </button>
      <p className="form-note">Your ticket will be sent to the local assistant API.</p>
    </form>
  );
}

TicketForm.defaultProps = { onSubmitted: () => {}, onTicketChange: () => {} };

export default TicketForm;
