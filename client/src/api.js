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

export async function getTickets() {
  const response = await fetch('/api/tickets');
  const rawResponse = await response.json();

  if (!response.ok) {
    throw new Error(rawResponse.error || 'Unable to load ticket history.');
  }

  return rawResponse;
}

export async function deleteTickets(ids) {
  const response = await fetch('/api/tickets', {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ ids }),
  });

  const rawResponse = await response.json();

  if (!response.ok) {
    throw new Error(rawResponse.error || 'Unable to delete selected tickets.');
  }

  return rawResponse;
}
