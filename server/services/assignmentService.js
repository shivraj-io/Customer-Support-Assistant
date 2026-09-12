const ASSIGNMENTS = {
  Billing: { agentName: 'Priya', team: 'Billing Team' },
  'Technical Issue': { agentName: 'Rahul', team: 'Tech Team' },
  Account: { agentName: 'Amit', team: 'Account Team' },
  'Feature Request': { agentName: 'Neha', team: 'Product Team' },
  General: { agentName: 'Support Desk', team: 'Support Team' },
};

export function getAssignedAgent(category) {
  return ASSIGNMENTS[category] ?? ASSIGNMENTS.General;
}
