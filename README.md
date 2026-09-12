# Customer Support Ticket Assistant

Customer Support Ticket Assistant is a small MERN-style support operations app. An agent can enter a ticket or choose a seeded sample, then receive an AI-generated category, priority, sentiment, confidence score, suggested next action, and editable customer reply. Processed tickets are stored in MongoDB and shown in the ticket history panel.

## Stack

- Frontend: React 19 with Vite and plain CSS
- Backend: Node.js with Express 5
- AI: OpenAI, Anthropic, or Google Gemini through one structured JSON classification call
- Database: MongoDB with Mongoose

## Setup

### Prerequisites

- Node.js 18 or newer
- A MongoDB connection string, local or MongoDB Atlas
- An API key for the selected AI provider

### Install dependencies

From the repository root:

```powershell
cd server
npm install

cd ..\client
npm install
```

### Configure the server

Copy the server environment template and fill in the values:

```powershell
Copy-Item server\.env.example server\.env
```

Set `MONGO_URI`, one provider API key, and the matching `AI_PROVIDER` (`gemini`, `openai`, or `anthropic`). The optional model variables default to `gemini-2.5-flash`, `gpt-4o-mini`, and `claude-3-5-haiku-latest` respectively.

## Run locally

Open two terminals from the repository root.

Terminal 1 — backend:

```powershell
cd server
npm start
```

The API listens on `http://localhost:3001`.

Terminal 2 — frontend:

```powershell
cd client
npm run dev
```

Open the Vite URL printed in the terminal, usually `http://localhost:5173`. The Vite development server proxies `/api` requests to the backend.

## Demo pitch

This assistant keeps sentiment separate from priority, so an angry customer with a non-blocking request still gets surfaced without being mislabeled as urgent. It is confidence-aware: low-confidence classifications are visibly flagged for human review instead of being treated as unquestionable automation. It also recommends a concrete next action, turning the tool from a reply generator into a practical triage assistant.

## Seeded demo tickets

The sample picker in the form includes angry-but-low-priority, urgent outage, ambiguous, billing refund, feature request, and login issue examples from `client/src/sampleTickets.js`.
