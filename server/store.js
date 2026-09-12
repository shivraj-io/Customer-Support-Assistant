const tickets = [];

export function addTicket(ticket) {
  tickets.unshift(ticket);
  return ticket;
}

export function getAllTickets() {
  return [...tickets];
}
