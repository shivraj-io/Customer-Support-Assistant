import { useEffect, useState } from 'react';
import { deleteTickets, getTickets } from '../api.js';

function TicketHistory({ refreshKey, onSelectTicket }) {
  const [tickets, setTickets] = useState([]);
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    let isCurrent = true;

    async function loadTickets() {
      setIsLoading(true);
      setError('');

      try {
        const nextTickets = await getTickets();
        if (isCurrent) {
          setTickets(nextTickets);
          setSelectedIds(new Set());
        }
      } catch (loadError) {
        if (isCurrent) setError(loadError.message);
      } finally {
        if (isCurrent) setIsLoading(false);
      }
    }

    loadTickets();
    return () => { isCurrent = false; };
  }, [refreshKey]);

  function toggleTicket(ticketId) {
    setSelectedIds((currentIds) => {
      const nextIds = new Set(currentIds);
      if (nextIds.has(ticketId)) nextIds.delete(ticketId);
      else nextIds.add(ticketId);
      return nextIds;
    });
  }

  function toggleAll() {
    setSelectedIds((currentIds) => (
      currentIds.size === tickets.length ? new Set() : new Set(tickets.map((ticket) => ticket.id))
    ));
  }

  async function handleDeleteSelected() {
    const ids = [...selectedIds];
    if (!ids.length || !window.confirm(`Delete ${ids.length} selected ticket${ids.length === 1 ? '' : 's'}?`)) return;

    setIsDeleting(true);
    setError('');

    try {
      await deleteTickets(ids);
      setTickets((currentTickets) => currentTickets.filter((ticket) => !selectedIds.has(ticket.id)));
      setSelectedIds(new Set());
      onSelectTicket(null);
    } catch (deleteError) {
      setError(deleteError.message);
    } finally {
      setIsDeleting(false);
    }
  }

  const allSelected = tickets.length > 0 && selectedIds.size === tickets.length;

  return (
    <section className="history-panel" aria-labelledby="history-heading">
      <div className="history-heading">
        <div>
          <p className="eyebrow">Recent work</p>
          <h2 id="history-heading">Ticket history</h2>
        </div>
        <span className="history-count">{tickets.length}</span>
      </div>

      {isLoading && (
        <p className="history-message loading-message">
          <span className="spinner spinner-muted" aria-hidden="true" />
          Loading history…
        </p>
      )}
      {!isLoading && error && <p className="history-error" role="alert">{error}</p>}
      {!isLoading && !error && tickets.length === 0 && (
        <p className="history-message">No tickets yet.</p>
      )}
      {!isLoading && !error && tickets.length > 0 && (
        <>
          <div className="history-actions">
            <label className="select-all-control">
              <input type="checkbox" checked={allSelected} onChange={toggleAll} />
              <span>Select all</span>
            </label>
            <button
              className="delete-button"
              type="button"
              disabled={!selectedIds.size || isDeleting}
              onClick={handleDeleteSelected}
            >
              {isDeleting ? 'Deleting…' : `Delete selected${selectedIds.size ? ` (${selectedIds.size})` : ''}`}
            </button>
          </div>
          <div className="history-list">
            {tickets.map((ticket) => (
              <div className="history-item" key={ticket.id}>
                <input
                  className="history-checkbox"
                  type="checkbox"
                  checked={selectedIds.has(ticket.id)}
                  onChange={() => toggleTicket(ticket.id)}
                  aria-label={`Select ${ticket.subject}`}
                />
                <button
                  className="history-item-button"
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
              </div>
            ))}
          </div>
        </>
      )}
    </section>
  );
}

TicketHistory.defaultProps = {
  refreshKey: 0,
  onSelectTicket: () => {},
};

export default TicketHistory;
