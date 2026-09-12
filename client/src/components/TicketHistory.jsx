import { useEffect, useState } from 'react';
import { getTickets } from '../api.js';

function TicketHistory({ refreshKey, onSelectTicket }) {
  const [tickets, setTickets] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let isCurrent = true;

    async function loadTickets() {
      setIsLoading(true);
      setError('');

      try {
        const nextTickets = await getTickets();
        if (isCurrent) setTickets(nextTickets);
      } catch (loadError) {
        if (isCurrent) setError(loadError.message);
      } finally {
        if (isCurrent) setIsLoading(false);
      }
    }

    loadTickets();
    return () => { isCurrent = false; };
  }, [refreshKey]);

  return (
    <section className="history-panel" aria-labelledby="history-heading">
      <div className="history-heading">
        <div>
          <p className="eyebrow">Recent work</p>
          <h2 id="history-heading">Ticket history</h2>
        </div>
        <span className="history-count">{tickets.length}</span>
      </div>

      {isLoading && <p className="history-message">Loading history…</p>}
      {!isLoading && error && <p className="history-error" role="alert">{error}</p>}
      {!isLoading && !error && tickets.length === 0 && (
        <p className="history-message">No tickets yet.</p>
      )}
      {!isLoading && !error && tickets.length > 0 && (
        <div className="history-list">
          {tickets.map((ticket) => (
            <button
              className="history-item"
              key={ticket.id}
              type="button"
              onClick={() => onSelectTicket(ticket)}
            >
              <span className={`priority-dot priority-dot-${ticket.priority?.toLowerCase()}`} aria-hidden="true" />
              <span className="history-item-copy">
                <strong>{ticket.subject}</strong>
                <small>{ticket.category} · {ticket.priority}</small>
              </span>
              <span className="history-arrow" aria-hidden="true">↗</span>
            </button>
          ))}
        </div>
      )}
    </section>
  );
}

TicketHistory.defaultProps = {
  refreshKey: 0,
  onSelectTicket: () => {},
};

export default TicketHistory;
