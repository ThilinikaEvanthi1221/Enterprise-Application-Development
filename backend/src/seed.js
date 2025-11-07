import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Rating from './models/Rating.js';

dotenv.config();

function randomInt(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min; }

function generateSampleRatings(count) {
  const names = ['Devon Lane', 'Kathryn Murphy', 'Courtney Henry', 'Guy Hawkins', 'Eleanor Pena'];
  const services = ['Oil Change', 'Brake Service', 'Tire Rotation', 'Engine Diagnostics', 'AC Repair'];
  const comments = ['Quick and friendly!', 'Great service and professional staff.', 'Could be faster but overall satisfied.', 'Transparent pricing. Will return.', 'Not happy with the wait time.'];
  const today = new Date();
  const arr = [];
  for (let i = 0; i < count; i++) {
    const overall = randomInt(3, 5);
    arr.push({
      customerName: names[randomInt(0, names.length - 1)],
      vehicleNo: `CAD-${randomInt(1000, 9999)}`,
      serviceType: services[randomInt(0, services.length - 1)],
      date: new Date(today.getTime() - randomInt(0, 90) * 24 * 60 * 60 * 1000),
      overallRating: overall,
      serviceQuality: Math.max(1, Math.min(5, overall + randomInt(-1, 1))),
      timeliness: Math.max(1, Math.min(5, overall + randomInt(-1, 1))),
      professionalism: Math.max(1, Math.min(5, overall + randomInt(-1, 1))),
      pricingTransparency: Math.max(1, Math.min(5, overall + randomInt(-1, 1))),
      comment: comments[randomInt(0, comments.length - 1)]
    });
  }
  return arr;
}

async function run() {
  const uri = process.env.MONGO_URI;
  if (!uri) throw new Error('MONGO_URI not set');
  await mongoose.connect(uri, { dbName: process.env.DB_NAME || 'autoservicepro' });
  await Rating.deleteMany({});
  const sample = generateSampleRatings(150);
  await Rating.insertMany(sample);
  console.log(`Inserted ${sample.length} ratings`);
  await mongoose.disconnect();
}

run().catch((e) => { console.error(e); process.exit(1); });


