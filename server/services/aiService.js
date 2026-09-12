import 'dotenv/config';

const CATEGORIES = ['Billing', 'Technical Issue', 'Account', 'Feature Request', 'General'];
const PRIORITIES = ['Low', 'Medium', 'High', 'Urgent'];
const SENTIMENTS = ['Calm', 'Frustrated', 'Angry'];

const GENERIC_RESPONSE =
  'Thanks for reaching out. We have received your request and will review it shortly.';

export const PROMPT_TEMPLATE = `You are a support-ticket triage assistant. Given the ticket below, return ONLY valid JSON
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
Ticket description: {{description}}`;

export function buildPrompt(subject, description) {
  return PROMPT_TEMPLATE
    .replace('{{subject}}', subject)
    .replace('{{description}}', description);
}

function fallbackResult() {
  return {
    category: 'General',
    priority: 'Medium',
    priorityReason: 'Review manually',
    sentiment: 'Calm',
    confidence: 50,
    nextAction: 'Review manually',
    suggestedResponse: GENERIC_RESPONSE,
    lowConfidence: true,
  };
}

function isValidResult(value) {
  return Boolean(
    value &&
      CATEGORIES.includes(value.category) &&
      PRIORITIES.includes(value.priority) &&
      SENTIMENTS.includes(value.sentiment) &&
      Number.isInteger(value.confidence) &&
      value.confidence >= 0 &&
      value.confidence <= 100 &&
      typeof value.priorityReason === 'string' &&
      typeof value.nextAction === 'string' &&
      typeof value.suggestedResponse === 'string',
  );
}

function parseAndValidate(rawOutput) {
  try {
    const parsed = JSON.parse(rawOutput);
    if (!isValidResult(parsed)) {
      console.warn('AI response failed validation; using fallback.', rawOutput);
      return fallbackResult();
    }

    return { ...parsed, lowConfidence: parsed.confidence < 60 };
  } catch {
    console.warn('AI response was not valid JSON; using fallback.', rawOutput);
    return fallbackResult();
  }
}

async function callOpenAI(prompt) {
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
      messages: [{ role: 'user', content: prompt }],
      response_format: { type: 'json_object' },
    }),
  });

  if (!response.ok) {
    throw new Error(`OpenAI request failed with status ${response.status}`);
  }

  const payload = await response.json();
  return payload.choices?.[0]?.message?.content || '';
}

async function callAnthropic(prompt) {
  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'x-api-key': process.env.ANTHROPIC_API_KEY,
      'anthropic-version': '2023-06-01',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: process.env.ANTHROPIC_MODEL || 'claude-3-5-haiku-latest',
      max_tokens: 700,
      messages: [{ role: 'user', content: prompt }],
    }),
  });

  if (!response.ok) {
    throw new Error(`Anthropic request failed with status ${response.status}`);
  }

  const payload = await response.json();
  return payload.content?.[0]?.text || '';
}

export async function classifyTicket(subject, description) {
  const provider = (process.env.AI_PROVIDER ||
    (process.env.OPENAI_API_KEY ? 'openai' : process.env.ANTHROPIC_API_KEY ? 'anthropic' : '')).toLowerCase();

  if (!provider) {
    throw new Error('No LLM provider configured. Set OPENAI_API_KEY or ANTHROPIC_API_KEY in server/.env.');
  }

  const prompt = buildPrompt(subject, description);
  const rawOutput = provider === 'anthropic' ? await callAnthropic(prompt) : await callOpenAI(prompt);
  return parseAndValidate(rawOutput);
}

export { fallbackResult, parseAndValidate };
