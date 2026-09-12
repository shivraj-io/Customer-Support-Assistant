# Design — Customer Support Ticket Assistant

## 1. Design Principles
- **Minimal, modern, functional.** No decorative clutter — this is a tool, not a marketing page.
- One primary screen. No navigation, no multi-page routing needed.
- Generous whitespace, clear hierarchy, soft shadows/rounded corners over heavy borders.

## 2. Layout
Two-column layout on desktop, stacked on mobile:

```
┌─────────────────────────────────────────────────────────┐
│  Header: "Ticket Assistant"                              │
│  Subtext: "Powered by [model] — classifies, prioritizes, │
│  and drafts replies in a single call."                   │
├───────────────────────────┬───────────────────────────────┤
│  LEFT (40%)                │  RIGHT (60%)                  │
│  New Ticket Form           │  Result Card (latest ticket)  │
│  - Customer name           │  - Category + Priority badges  │
│  - Subject                 │  - Sentiment badge              │
│  - Description (textarea)  │  - Confidence % (+ "needs      │
│  - [Try a sample ticket]   │    review" flag if low)        │
│    dropdown (5-8 seeded)   │  - Priority reason (small text)│
│  - [Analyze Ticket] button │  - Suggested next action (bold │
│                             │    single line)                 │
│                             │  - Suggested response (textarea│
│                             │    editable) + Copy button     │
│  Below form: Ticket History│                                 │
│  (compact list, click to   │                                 │
│  reload into result card)  │                                 │
└───────────────────────────┴───────────────────────────────┘
```

## 3. Visual System
- **Color palette:**
  - Background: `#F7F7F8` (light neutral gray)
  - Surface/cards: `#FFFFFF` with `box-shadow: 0 1px 3px rgba(0,0,0,0.08)`
  - Primary accent: `#4F46E5` (indigo) — buttons, active states
  - Text: `#111827` (near-black), secondary text `#6B7280`
- **Priority badge colors:**
  - Low: `#10B981` (green)
  - Medium: `#F59E0B` (amber)
  - High: `#F97316` (orange)
  - Urgent: `#EF4444` (red)
- **Category badge:** neutral gray pill (`#E5E7EB` bg, `#374151` text) — priority color should carry the visual weight, not category.
- **Sentiment badge:** distinct shape from priority (e.g. outline pill instead of filled) so it never gets confused with priority at a glance:
  - Calm: outline gray
  - Frustrated: outline amber
  - Angry: outline red, with a subtle icon (e.g. a small "!" or frown glyph)
- **Confidence indicator:** small percentage text next to the category badge (e.g. "92% confident"). If `lowConfidence` is true, show a small warning chip: "Needs review" in muted red, next to the category — this is a key demo beat, make it visually obvious, not buried.
- **Typography:** system font stack (`-apple-system, Inter, Segoe UI, sans-serif`), 15–16px base, 600 weight for headers/badges.
- **Corners:** 10–12px border-radius on cards, 8px on inputs/buttons.
- **Spacing:** 16–24px padding inside cards, 12px gaps between form fields.

## 4. Components

### Header
- Simple text logo/title, left-aligned. Optional small subtitle: "AI-powered triage & response drafting".

### Ticket Form
- Labeled inputs, subtle gray borders (`#D1D5DB`), focus state = indigo outline.
- Primary button "Analyze Ticket" — solid indigo, white text, full-width on mobile.
- Disabled/loading state on button while waiting for AI response ("Analyzing…" with a small spinner).

### Result Card
- Top row: Category pill + Priority pill + Sentiment pill side by side. "Needs review" chip appears here too if confidence is low.
- Confidence % as small muted text right after the category pill.
- Priority reason as small italic gray subtext under the badges.
- Suggested next action: a distinct single-line callout (e.g. light indigo background strip with a small arrow icon) — "→ Escalate to billing team". This should visually separate from the customer-facing response so it reads as "internal note."
- Suggested response in a bordered textarea (editable), with a "Copy" button top-right of that section.
- Empty state (before first ticket): a centered muted message — "Submit a ticket to see the AI's triage and suggested response here."

### Sample Ticket Picker
- A small dropdown/select above the form: "Try a sample ticket ▾" with 5–8 seeded options (angry-but-low-priority, urgent outage, ambiguous, billing refund, feature request).
- Selecting one auto-fills the form fields; the user still clicks "Analyze Ticket" to run it. This exists purely for smooth, reliable demoing — don't type ticket text live in front of judges.

### Ticket History
- Compact list: subject (truncated) + priority dot + relative timestamp.
- Clicking an item loads it back into the Result Card.
- Empty state: "No tickets yet."

## 5. States to Handle
- Empty state (no tickets yet)
- Loading state (spinner/disabled button during API call)
- Error state (red inline banner: "Something went wrong — try again")
- Success state (result card populated)

## 6. Responsive Behavior
- Below ~768px: stack into a single column — form on top, result card below it, history below that.
- Buttons and inputs full-width on mobile.

## 7. Nice-to-haves (only if time remains)
- Subtle fade/slide-in animation when the result card updates.
- Dark mode toggle.
- Priority badge pulses briefly for "Urgent" to draw attention.
