import 'dotenv/config';
import express from 'express';
import ticketsRouter from './routes/tickets.js';

const app = express();
const port = Number(process.env.PORT) || 3001;

app.use(express.json());
app.use('/api/tickets', ticketsRouter);

app.listen(port, () => {
  console.log(`Ticket Assistant server listening on port ${port}`);
});
