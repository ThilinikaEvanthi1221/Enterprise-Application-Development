import { Router } from 'express';
import Rating from '../models/Rating.js';

const router = Router();

router.get('/', async (req, res) => {
  try {
    const { page = 1, limit = 10, search = '', sortBy = 'date', sortOrder = 'desc', dateFrom, dateTo, minRating, maxRating, serviceType } = req.query;
    const query = {};
    if (search) {
      const pattern = new RegExp(search, 'i');
      query.$or = [{ customerName: pattern }, { vehicleNo: pattern }, { comment: pattern }];
    }
    if (dateFrom || dateTo) {
      query.date = {};
      if (dateFrom) query.date.$gte = new Date(dateFrom);
      if (dateTo) query.date.$lte = new Date(dateTo);
    }
    if (minRating || maxRating) {
      query.overallRating = {};
      if (minRating) query.overallRating.$gte = Number(minRating);
      if (maxRating) query.overallRating.$lte = Number(maxRating);
    }
    if (serviceType) query.serviceType = serviceType;

    const sort = { [sortBy]: sortOrder === 'asc' ? 1 : -1 };
    const [items, total] = await Promise.all([
      Rating.find(query).sort(sort).skip((page - 1) * limit).limit(Number(limit)),
      Rating.countDocuments(query)
    ]);
    res.json({ page: Number(page), limit: Number(limit), total, items });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to fetch ratings' });
  }
});

router.get('/summary', async (_req, res) => {
  try {
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const [kpis] = await Rating.aggregate([
      {
        $facet: {
          all: [
            { $group: { _id: null, total: { $sum: 1 }, avgOverall: { $avg: '$overallRating' }, positive: { $sum: { $cond: [{ $gte: ['$overallRating', 4] }, 1, 0] } } } }
          ],
          month: [ { $match: { date: { $gte: monthStart } } }, { $count: 'count' } ],
          breakdown: [
            { $group: { _id: null, serviceQuality: { $avg: '$serviceQuality' }, timeliness: { $avg: '$timeliness' }, professionalism: { $avg: '$professionalism' }, pricingTransparency: { $avg: '$pricingTransparency' }, overallSatisfaction: { $avg: '$overallRating' } } }
          ]
        }
      }
    ]);
    const all = kpis.all[0] || { total: 0, avgOverall: 0, positive: 0 };
    const breakdown = kpis.breakdown[0] || { serviceQuality: 0, timeliness: 0, professionalism: 0, pricingTransparency: 0, overallSatisfaction: 0 };
    const servicesThisMonth = kpis.month[0]?.count || 0;
    res.json({
      averageOverallRating: Number(all.avgOverall?.toFixed(1) || 0),
      totalFeedbacks: all.total,
      servicesRatedThisMonth: servicesThisMonth,
      positiveReviewPercent: all.total ? Math.round((all.positive / all.total) * 100) : 0,
      breakdown
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to compute summary' });
  }
});

router.post('/', async (req, res) => {
  try {
    const rating = await Rating.create(req.body);
    res.status(201).json(rating);
  } catch (err) {
    console.error(err);
    res.status(400).json({ message: 'Failed to create rating' });
  }
});

router.post('/seed', async (_req, res) => {
  try {
    const sample = generateSampleRatings(120);
    await Rating.deleteMany({});
    await Rating.insertMany(sample);
    res.json({ inserted: sample.length });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to seed ratings' });
  }
});

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

export default router;


