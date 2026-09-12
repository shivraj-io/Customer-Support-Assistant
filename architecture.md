# Architecture — Customer Support Ticket Assistant

## 1. Stack (chosen for speed with Codex + MERN familiarity)
- **Frontend:** React (Vite) + plain CSS (or Tailwind if Codex scaffolds it fast)
- **Backend:** Node.js + Express
- **AI:** Single LLM API call (Anthropic or OpenAI — whichever key is available) doing classification + priority + response generation in one structured-JSON prompt
- **Storage:** In-memory array on the backend (no DB). Optional: persist to a local `tickets.json` file so data survives a server restart.
- **No auth, no queue, no external ticketing integration.**

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
                        [Store ticket + result in-memory]
                                        |
                                        v
[React renders Ticket Card] <--response-- [Return ticket object]
```

## 3. Folder Structure
```
ticket-assistant/
├── server/
│   ├── index.js              # Express app entry
│   ├── routes/
│   │   └── tickets.js        # POST /api/tickets, GET /api/tickets
│   ├── services/
│   │   └── aiService.js      # buildPrompt(), classifyTicket()
│   ├── store.js              # in-memory tickets array + helpers
│   └── .env                  # API key
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

## 4. API Contract

### POST `/api/tickets`
**Request:**
```json
{ "customerName": "Optional", "subject": "Cannot log in", "description": "Getting 500 error since this morning" }
```
**Response (200):**
```json
{
  "id": "uuid",
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
Returns array of all processed tickets (newest first), for the history panel.

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

## 7. Demo Support Files
- `server/sampleTickets.js` (or `client/src/sampleTickets.js`): 5–8 hardcoded tickets covering an angry-but-low-priority case, an urgent outage, an ambiguous ticket, a billing refund, and a feature request. Used for one-click demo submission — don't type ticket text live during judging.
- `README.md` at repo root: what it does, stack used, setup commands, and a 2–3 sentence pitch highlighting sentiment-vs-priority + confidence flagging + next-action as the differentiators.

## 8. What to Cut First Under Time Pressure
1. `tickets.json` file persistence — pure in-memory is fine.
2. Editable response textarea — read-only display is acceptable.
3. Tailwind setup — hand-rolled CSS is faster if Codex stalls on config.
4. `nextAction` field — cut last, since it's just one more JSON key on the same call (near-zero cost), but if the prompt is misbehaving, drop it before touching category/priority.
