import { useState } from 'react';
import TicketForm from './components/TicketForm.jsx';
import TicketCard from './components/TicketCard.jsx';
import TicketHistory from './components/TicketHistory.jsx';

function App() {
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [historyRefreshKey, setHistoryRefreshKey] = useState(0);

  function handleSubmitted(ticket) {
    setSelectedTicket(ticket);
    setHistoryRefreshKey((currentKey) => currentKey + 1);
  }

  function handleResponseChange(suggestedResponse) {
    setSelectedTicket((currentTicket) => (
      currentTicket ? { ...currentTicket, suggestedResponse } : currentTicket
    ));
  }

  return (
    <main className="app-shell">
      <header className="app-header">
        <p className="eyebrow">Support operations</p>
        <h1>Ticket Assistant</h1>
        <p className="subtitle">
          Powered by AI — classifies, prioritizes, and drafts replies in a single call.
        </p>
      </header>

      <div className="workspace-grid">
        <div className="left-column">
          <section className="form-card" aria-labelledby="new-ticket-heading">
            <div className="section-heading">
              <div>
                <p className="eyebrow">New request</p>
                <h2 id="new-ticket-heading">Analyze a support ticket</h2>
              </div>
              <span className="status-dot">Ready</span>
            </div>
            <TicketForm onSubmitted={handleSubmitted} />
          </section>
          <TicketHistory
            refreshKey={historyRefreshKey}
            onSelectTicket={setSelectedTicket}
          />
        </div>
        <div className="right-column">
          <TicketCard
            ticket={selectedTicket}
            onResponseChange={handleResponseChange}
          />
        </div>
      </div>
    </main>
  );
}

export default App;
