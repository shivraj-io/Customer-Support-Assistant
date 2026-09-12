import { classifyTicket } from './services/aiService.js';

try {
  const result = await classifyTicket(
    'Cannot log in',
    'I have received a 500 error every time I try to log in since this morning.',
  );
  console.log(JSON.stringify(result, null, 2));
} catch (error) {
  console.error(error.message);
  process.exitCode = 1;
}
