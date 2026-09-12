import 'dotenv/config';
import express from 'express';
import ticketsRouter from './routes/tickets.js';
import { connectDB } from './db.js';

const app = express();
const port = Number(process.env.PORT) || 3001;

app.use(express.json());
app.use('/api/tickets', ticketsRouter);

async function startServer() {
  try {
    await connectDB();
    app.listen(port, () => {
      console.log(`Ticket Assistant server listening on port ${port}`);
    });
  } catch (error) {
    console.error('Unable to connect to MongoDB:', error.message);
    process.exitCode = 1;
  }
}

startServer();
