export async function submitTicket(ticket) {
  const response = await fetch('/api/tickets', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(ticket),
  });

  const rawResponse = await response.json();

  if (!response.ok) {
    throw new Error(rawResponse.error || 'Unable to submit ticket.');
  }

  return rawResponse;
}
