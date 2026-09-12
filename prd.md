# PRD — Customer Support Ticket Assistant

## 1. Problem
Support teams manually read, categorize, prioritize, and draft replies to every incoming ticket. This is slow and inconsistent.

## 2. Goal (2-hour MVP scope)
Build a web app where a user submits a support ticket (subject + description) and the system automatically:
1. **Classifies** it into a category
2. **Assigns** a priority level
3. **Generates** a suggested reply

This is a demo-quality MVP, not production software. Optimize for "it works end-to-end" over completeness.

## 3. Users
- Support agent (primary): pastes/enters a ticket, reviews AI output, copies the response.

## 4. Core Features (in scope)
| # | Feature | Description |
|---|---------|-------------|
| 1 | Ticket submission form | Fields: customer name (optional), subject, description |
| 2 | Classification | Category: `Billing`, `Technical Issue`, `Account`, `Feature Request`, `General` |
| 3 | Priority assignment | `Low`, `Medium`, `High`, `Urgent` — based on content (e.g. "down", "can't login", "refund" → higher) |
| 4 | Response generation | Draft, editable, empathetic reply matching category + priority |
| 5 | Ticket list/history | Persisted in MongoDB — history survives server restarts, sorted newest first |
| 6 | Copy/edit response | Agent can edit the generated response before "sending" (no real email send needed) |
| 7 | Sentiment/frustration level | Separate from priority — `Calm`, `Frustrated`, `Angry`. Lets a low-priority ticket still surface an angry customer |
| 8 | Confidence score | Model's self-reported confidence (0–100%) in its category call; low confidence (<60%) is visually flagged for manual review |
| 9 | Suggested next action | One short action beyond the reply text, e.g. "Escalate to billing team" or "Check server status page" |

## 4a. Hackathon Differentiators (why this stands out)
These are the features above (7–9) framed as the demo's core pitch — call this out explicitly when presenting:
- **Priority ≠ sentiment.** Most triage tools conflate "urgent" with "upset." This app shows both, so a *low-priority feature request from a furious customer* doesn't get silently deprioritized.
- **Confidence-aware, not blind automation.** Low-confidence classifications are flagged for human review instead of auto-applied — this is the "we didn't just trust the black box" story for judges.
- **Assistant, not just a text generator.** The suggested next action turns this from "writes replies" into "tells you what to do."

## 5. Out of Scope (for the 2-hour build)
- Authentication / multi-user accounts
- Real email/ticketing integrations (Zendesk, Freshdesk, etc.)
- Analytics dashboards, SLA tracking, multi-language support
- Fine-tuned custom ML model — use a single LLM API call with a structured prompt instead

Note: persistence is now **in scope** via MongoDB (see section 4, feature 5) — tickets survive server restarts, which strengthens the "this is a real MERN app" story for judges. Auth is still explicitly out of scope; there's still only one implicit user (the agent) with no need for login/roles.

## 6. Success Criteria
- Submitting a ticket returns category + priority + sentiment + confidence + draft response + next action in under a few seconds.
- Output is structurally correct (valid category/priority/sentiment values every time).
- UI is clean, minimal, and usable on first look — no onboarding needed.
- Runs locally with one `npm install` + one command per service (plus a MongoDB connection string set in `.env`).
- Demo never shows a blank/broken screen even if the LLM API is slow or rate-limited (fallback response kicks in).
- Ticket history survives a backend restart — provable live by restarting the server mid-demo and showing the history panel still has data.

## 6a. Demo Readiness (do this even though it's not a "feature")
- Prepare **5–8 seed tickets** in `client/src/sampleTickets.js` (or a JSON file) covering: an angry-but-low-priority ticket, an urgent outage, an ambiguous one, a billing refund, a feature request. Paste these live instead of improvising ticket text during the demo.
- Add a one-line strip under the header: *"Powered by [model] — classifies, prioritizes, and drafts replies in a single call."* Judges skim fast; make the tech visible without being asked.
- Write a short `README.md`: what it does, stack, setup steps, and a 2–3 sentence pitch (many hackathons score the repo, not just the live demo).

## 7. Functional Requirements
- FR1: User can submit a ticket via a form.
- FR2: On submit, the backend calls an LLM with the ticket text and a structured prompt, requesting JSON output: `{category, priority, priority_reason, suggested_response}`.
- FR3: Backend validates the LLM's JSON before returning it (fallback to `General` / `Medium` if malformed).
- FR4: Frontend displays the result as a "Ticket Card" with category badge, priority badge, and an editable response textarea.
- FR5: Processed tickets are saved to MongoDB and are listed in a sidebar/history panel, persisting across backend restarts.
- FR6: Basic error states (empty form, API failure) are handled gracefully with a visible message.

## 8. Non-Functional Requirements
- Response time: < 5s per ticket (dependent on LLM latency).
- Simple, minimal, modern UI (see design.md).
- Codebase small enough for one person to build and understand in 2 hours.

## 9. Build Priority Order (if time runs short)
1. Backend endpoint that classifies + prioritizes + generates response (hardcode a test ticket, confirm JSON shape) — do this before touching MongoDB at all, so the AI logic is proven independently.
2. Set up MongoDB (Atlas free tier recommended) + Mongoose model, wire the classify endpoint to save to it.
3. Frontend form → calls backend → renders result card.
4. History list (now reading from MongoDB).
5. Add sentiment, confidence, and next-action fields to the same LLM call (near-zero extra time — same prompt, more fields).
6. Seed ticket data + README (demo readiness).
7. Styling polish.
8. (Cut first if short on time) Edit-response feature, empty/error states, confidence-flag styling. If MongoDB setup itself is stalling past ~15–20 minutes, fall back to in-memory storage (see architecture.md section 8) rather than lose the whole build to DB configuration.
