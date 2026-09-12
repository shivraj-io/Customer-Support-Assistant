# Architecture — Customer Support Ticket Assistant

## 1. Stack (chosen for speed with Codex + MERN familiarity)
- **Frontend:** React (Vite) + plain CSS (or Tailwind if Codex scaffolds it fast)
- **Backend:** Node.js + Express
- **AI:** Single LLM API call (Anthropic or OpenAI — whichever key is available) doing classification + priority + response generation in one structured-JSON prompt
- **Database:** MongoDB via Mongoose. Tickets persist across server restarts and across the whole demo — this also makes the project read as a real MERN stack, not a toy.
- **No auth, no queue, no external ticketing integration.** (In-memory fallback is documented in section 8 if MongoDB setup eats too much time.)

## 2. High-Level Flow
```
[React Form] --POST /api/tickets--> [Express API]
                                        |
                                        v
                              [Build prompt from ticket]
                                        |
                                        v
                              [Call LLM API, request JSON]
                                        |
                                        v
                        [Validate/parse JSON, fallback if malformed]
                                        |
                                        v
                        [Save ticket + result to MongoDB]
                                        |
                                        v
[React renders Ticket Card] <--response-- [Return saved ticket document]
```

## 3. Folder Structure
```
ticket-assistant/
├── server/
│   ├── index.js              # Express app entry, connects to MongoDB on startup
│   ├── db.js                 # Mongoose connection setup
│   ├── models/
│   │   └── Ticket.js         # Mongoose schema/model
│   ├── routes/
│   │   └── tickets.js        # POST /api/tickets, GET /api/tickets
│   ├── services/
│   │   └── aiService.js      # buildPrompt(), classifyTicket()
│   ├── .env                  # API key + MONGO_URI
│   └── .env.example
└── client/
    ├── src/
    │   ├── App.jsx
    │   ├── components/
    │   │   ├── TicketForm.jsx
    │   │   ├── TicketCard.jsx
    │   │   └── TicketHistory.jsx
    │   ├── api.js             # fetch wrapper for backend
    │   └── styles.css
    └── index.html
```

## 3a. MongoDB Setup
- **Fastest option for a hackathon:** MongoDB Atlas free tier (cloud, no local install, connection string in `.env` as `MONGO_URI`). Avoids installing/running `mongod` locally under time pressure.
- **Local option:** if MongoDB is already installed and running locally, `MONGO_URI=mongodb://localhost:27017/ticket-assistant` works fine — no cloud setup needed.
- **Ticket schema (`models/Ticket.js`):**
```js
{
  customerName: { type: String, default: "" },
  subject: { type: String, required: true },
  description: { type: String, required: true },
  category: { type: String, enum: ["Billing", "Technical Issue", "Account", "Feature Request", "General"], required: true },
  priority: { type: String, enum: ["Low", "Medium", "High", "Urgent"], required: true },
  priorityReason: String,
  sentiment: { type: String, enum: ["Calm", "Frustrated", "Angry"], required: true },
  confidence: { type: Number, min: 0, max: 100 },
  lowConfidence: Boolean,
  nextAction: String,
  suggestedResponse: String,
  createdAt: { type: Date, default: Date.now }
}
```
- **`db.js`** connects once on server startup (`mongoose.connect(process.env.MONGO_URI)`) and logs success/failure clearly — if the connection fails, log it loudly and exit, rather than silently running with broken persistence.

## 4. API Contract

### POST `/api/tickets`
**Request:**
```json
{ "customerName": "Optional", "subject": "Cannot log in", "description": "Getting 500 error since this morning" }
```
**Response (200):**
```json
{
  "id": "<MongoDB _id>",
  "customerName": "Optional",
  "subject": "Cannot log in",
  "description": "Getting 500 error since this morning",
  "category": "Technical Issue",
  "priority": "High",
  "priorityReason": "Blocking access to the product for an active user",
  "sentiment": "Frustrated",
  "confidence": 87,
  "nextAction": "Escalate to engineering — check server status page",
  "suggestedResponse": "Hi ..., I'm sorry you're running into this...",
  "createdAt": "2026-09-12T10:00:00Z",
  "lowConfidence": false
}
```
`lowConfidence` is computed by the backend (`confidence < 60`), not the LLM — used by the frontend to show a "needs review" flag.
**Response (4xx/5xx):** `{ "error": "message" }`

### GET `/api/tickets`
Returns array of all processed tickets from MongoDB, sorted `createdAt` descending (newest first), for the history panel. Tickets now persist across server restarts — history survives even if you stop/restart the backend mid-demo.

## 5. AI Prompting Strategy
Single call, single prompt, ask for JSON only — all fields (including the differentiators) come from this one call, so there's no added latency cost for adding them:
```
You are a support-ticket triage assistant. Given the ticket below, return ONLY valid JSON
(no markdown, no commentary) with this exact shape:
{
  "category": "Billing" | "Technical Issue" | "Account" | "Feature Request" | "General",
  "priority": "Low" | "Medium" | "High" | "Urgent",
  "priorityReason": "one short sentence",
  "sentiment": "Calm" | "Frustrated" | "Angry",
  "confidence": <integer 0-100, how confident you are in the category classification>,
  "nextAction": "one short recommended internal action, not customer-facing",
  "suggestedResponse": "a short, empathetic reply to the customer, 3-5 sentences"
}

Ticket subject: {{subject}}
Ticket description: {{description}}
```
Backend parses the JSON and validates every field against its allowed set:
- If parsing fails entirely, or `category`/`priority`/`sentiment` are missing/invalid → fall back to `category: "General"`, `priority: "Medium"`, `sentiment: "Calm"`, `confidence: 50`, `nextAction: "Review manually"`, and a generic acknowledgment response.
- Compute `lowConfidence = confidence < 60` server-side.
- Log the raw LLM output whenever a fallback triggers, for debugging.
- This fallback path is also what protects the demo if the LLM API is slow/rate-limited during judging — the request still returns 200 with sensible defaults instead of erroring out.

## 6. Error Handling
- Empty subject/description → 400 before calling the LLM.
- LLM call fails/times out → return 502 with a friendly error; frontend shows a retry button.
- Malformed JSON from LLM → fallback values (see above), still return 200 so the demo doesn't break.
- **MongoDB connection fails on startup** → log a clear error and stop the server (fail loud at boot, not silently mid-demo). Double-check `MONGO_URI` is correct before the demo starts.
- **MongoDB write fails on a single request** (rare, e.g. transient network blip on Atlas) → return 502 with a friendly error; the AI classification already succeeded, so this only affects persistence, not the on-screen result — consider still rendering the result card even if the save fails, so the demo isn't blocked by a DB hiccup.

## 7. Demo Support Files
- `server/sampleTickets.js` (or `client/src/sampleTickets.js`): 5–8 hardcoded tickets covering an angry-but-low-priority case, an urgent outage, an ambiguous ticket, a billing refund, and a feature request. Used for one-click demo submission — don't type ticket text live during judging.
- `README.md` at repo root: what it does, stack used, setup commands, and a 2–3 sentence pitch highlighting sentiment-vs-priority + confidence flagging + next-action as the differentiators.

## 8. What to Cut First Under Time Pressure
1. **MongoDB Atlas setup taking too long?** Fall back to a local `mongod` if installed, or as a last resort revert to the original in-memory array (`store.js` with a plain JS array) — the API contract (section 4) stays identical either way, so nothing else in the app needs to change. Don't let DB setup block the rest of the build past ~15–20 minutes.
2. Editable response textarea — read-only display is acceptable.
3. Tailwind setup — hand-rolled CSS is faster if Codex stalls on config.
4. `nextAction` field — cut last, since it's just one more JSON key on the same call (near-zero cost), but if the prompt is misbehaving, drop it before touching category/priority.
