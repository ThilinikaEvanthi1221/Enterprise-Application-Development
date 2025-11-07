import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import morgan from 'morgan';
import dotenv from 'dotenv';

import ratingsRouter from './routes/ratings.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI;

app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', service: 'autoservicepro-backend' });
});

app.use('/api/ratings', ratingsRouter);

async function start() {
  try {
    if (!MONGO_URI) {
      throw new Error('MONGO_URI not set');
    }
    await mongoose.connect(MONGO_URI, { dbName: process.env.DB_NAME || 'autoservicepro' });
    console.log('Connected to MongoDB');
    app.listen(PORT, () => console.log(`Server listening on port ${PORT}`));
  } catch (err) {
    console.error('Failed to start server', err);
    process.exit(1);
  }
}

start();


