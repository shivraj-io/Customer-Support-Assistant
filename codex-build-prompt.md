# Codex Build Prompt — Customer Support Ticket Assistant

Paste this whole thing into Codex as your first message. Keep `prd.md`, `architecture.md`,
and `design.md` in the same folder/repo root before you start — the prompt tells Codex to
read them directly instead of relying on this text alone.

---

## PROMPT (copy from here down)

You are building a web app called **Ticket Assistant** for a hackathon. I have three spec
files in this repo root: `prd.md`, `architecture.md`, and `design.md`. Read all three fully
before writing any code — they are the source of truth for scope, API shape, and UI.

**Rules to prevent you from hallucinating or drifting from spec:**
1. Do not invent features, fields, or endpoints that aren't in these three files. If
   something is ambiguous or missing, make the smallest reasonable assumption, state it
   in one line in your response, and continue — do not stop and ask me unless you are
   fully blocked.
2. Follow the exact JSON field names given in `architecture.md` section 4 (API Contract)
   and section 5 (AI Prompting Strategy) — do not rename, add, or drop fields.
3. Follow the exact folder structure in `architecture.md` section 3 unless there's a
   concrete technical reason not to (explain it if you deviate).
4. Follow the exact color values, badge styles, and layout described in `design.md` —
   don't substitute your own default styling.
5. Build in the exact step order below. Do not skip ahead or combine steps. After each
   step, briefly confirm what you built and that it runs, before moving to the next step.
6. If a step fails or an API call errors, fix it before moving on — don't leave broken
   code and continue building on top of it.
7. Use plain, working code over clever abstractions. This is a 2-hour hackathon build —
   prioritize "it runs end-to-end" over elegance.

**Tech stack (do not substitute):** React (Vite) frontend, Node.js + Express backend,
a single LLM API call per ticket (Anthropic or OpenAI — use whichever API key is present
in `.env`; ask me for the key/provider if neither is set), in-memory storage on the
backend (no database).

---

### Step 1 — Backend skeleton + AI service (do this first, in isolation)
- Set up `server/` with Express, `dotenv`, and a `.env.example`.
- Build `server/services/aiService.js` with a `classifyTicket(subject, description)`
  function that builds the exact prompt from `architecture.md` section 5 and calls the
  LLM API, requesting JSON-only output.
- Add JSON parsing + validation exactly as specified in `architecture.md` section 5
  (allowed values for category/priority/sentiment; fallback object if parsing fails or
  fields are invalid; compute `lowConfidence` server-side as `confidence < 60`).
- Write a tiny test script (or a temporary console.log call) that runs `classifyTicket`
  against one hardcoded ticket and prints the result, so we can confirm the JSON shape
  is correct before building the API layer on top of it.
- Stop here and show me the output of that test call before continuing.

### Step 2 — Backend API + in-memory store
- Build `server/store.js` (in-memory array of tickets).
- Build `server/routes/tickets.js` with `POST /api/tickets` and `GET /api/tickets`,
  matching the request/response shapes in `architecture.md` section 4 exactly, including
  the `id`, `createdAt`, and `lowConfidence` fields.
- Add the error handling from `architecture.md` section 6 (400 for empty fields, 502 for
  LLM failure, graceful fallback for malformed JSON).
- Wire this into `server/index.js` and confirm the server starts and both endpoints work
  via curl or a REST client before moving on.

### Step 3 — Frontend skeleton + form
- Scaffold `client/` with Vite + React.
- Build `TicketForm.jsx` with the exact fields from `prd.md` section 4 (customer name,
  subject, description) plus the "Try a sample ticket" dropdown from `design.md`.
- Build `client/src/sampleTickets.js` with 5–8 seed tickets covering: angry-but-low-
  priority, urgent outage, ambiguous, billing refund, feature request (per `prd.md`
  section 6a and `architecture.md` section 7).
- Wire the form to `POST /api/tickets` via `client/src/api.js`. Confirm submitting the
  form actually reaches the backend and logs a response in the browser console before
  continuing to the result UI.

### Step 4 — Result card + history
- Build `TicketCard.jsx` matching `design.md` section 4 (Result Card) exactly: category
  pill, priority pill, sentiment pill, confidence % + "Needs review" chip if low
  confidence, priority reason subtext, next-action callout, editable suggested-response
  textarea with a Copy button.
- Build `TicketHistory.jsx`: compact list of past tickets (subject, priority dot,
  timestamp), clicking one reloads it into the Result Card. Fetch from `GET /api/tickets`.
- Wire everything into `App.jsx` per the two-column layout in `design.md` section 2.

### Step 5 — Styling pass
- Apply the exact color palette, typography, spacing, and border-radius values from
  `design.md` section 3.
- Add the empty state, loading state (disabled button + "Analyzing…"), and error state
  (red inline banner) described in `design.md` sections 4 and 5.
- Add the header subtext ("Powered by [model] — classifies, prioritizes, and drafts
  replies in a single call.") from `design.md` section 2.
- Make it responsive per `design.md` section 6 (stack to one column below ~768px).

### Step 6 — Demo readiness (only if time remains)
- Write `README.md`: what it does, stack, setup steps, and a 2–3 sentence pitch that
  highlights sentiment-vs-priority separation, confidence-aware flagging, and the
  suggested-next-action as the differentiators (per `prd.md` section 6a).
- Do a final end-to-end run-through: start both servers, submit 2–3 sample tickets,
  confirm no console errors, confirm the "Needs review" flag actually triggers on at
  least one sample ticket.

---

**After each step, tell me explicitly: what you built, any assumption you made, and
whether it runs cleanly — then wait for me to say "continue" before starting the next
step**, unless I've told you to run through all steps unattended.
