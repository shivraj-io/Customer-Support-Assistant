import TicketForm from './components/TicketForm.jsx';

function App() {
  return (
    <main className="app-shell">
      <header className="app-header">
        <p className="eyebrow">Support operations</p>
        <h1>Ticket Assistant</h1>
        <p className="subtitle">
          Powered by AI — classifies, prioritizes, and drafts replies in a single call.
        </p>
      </header>

      <section className="form-card" aria-labelledby="new-ticket-heading">
        <div className="section-heading">
          <div>
            <p className="eyebrow">New request</p>
            <h2 id="new-ticket-heading">Analyze a support ticket</h2>
          </div>
          <span className="status-dot">Ready</span>
        </div>
        <TicketForm />
      </section>
    </main>
  );
}

export default App;
