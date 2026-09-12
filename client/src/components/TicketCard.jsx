import { useState } from 'react';

function TicketCard({ ticket, onResponseChange }) {
  const [copied, setCopied] = useState(false);

  if (!ticket) {
    return (
      <section className="result-card empty-result" aria-labelledby="result-heading">
        <div className="card-heading">
          <div>
            <p className="eyebrow">Latest analysis</p>
            <h2 id="result-heading">Ticket result</h2>
          </div>
        </div>
        <p className="empty-result-message">
          Submit a ticket to see the AI&apos;s triage and suggested response here.
        </p>
      </section>
    );
  }

  async function copyResponse() {
    try {
      await navigator.clipboard.writeText(ticket.suggestedResponse || '');
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
    } catch {
      setCopied(false);
    }
  }

  return (
    <section className="result-card" aria-labelledby="result-heading">
      <div className="card-heading">
        <div>
          <p className="eyebrow">Latest analysis</p>
          <h2 id="result-heading">Ticket result</h2>
        </div>
        <span className="result-subject" title={ticket.subject}>{ticket.subject}</span>
      </div>

      <div className="badge-row" aria-label="Ticket classification">
        <span className="badge category-badge">{ticket.category}</span>
        <span className={`badge priority-badge priority-${ticket.priority?.toLowerCase()}`}>
          {ticket.priority}
        </span>
        <span className={`badge sentiment-badge sentiment-${ticket.sentiment?.toLowerCase()}`}>
          {ticket.sentiment === 'Angry' && <span aria-hidden="true">!</span>} {ticket.sentiment}
        </span>
        {ticket.assignedAgent && ticket.assignedTeam && (
          <span className="badge category-badge">Assigned to: {ticket.assignedAgent} · {ticket.assignedTeam}</span>
        )}
        <span className="confidence">{ticket.confidence}% confident</span>
        {ticket.lowConfidence && <span className="review-chip">Needs review</span>}
      </div>

      <p className="priority-reason">{ticket.priorityReason}</p>

      <div className="next-action">
        <span className="next-action-icon" aria-hidden="true">→</span>
        <div>
          <span className="next-action-label">Suggested next action</span>
          <strong>{ticket.nextAction}</strong>
        </div>
      </div>

      <div className="response-section">
        <div className="response-heading">
          <label htmlFor="suggested-response">Suggested response</label>
          <button type="button" className="copy-button" onClick={copyResponse}>
            {copied ? 'Copied' : 'Copy'}
          </button>
        </div>
        <textarea
          id="suggested-response"
          value={ticket.suggestedResponse || ''}
          onChange={(event) => onResponseChange(event.target.value)}
          rows="7"
          aria-label="Suggested response"
        />
      </div>
    </section>
  );
}

TicketCard.defaultProps = {
  ticket: null,
  onResponseChange: () => {},
};

export default TicketCard;
