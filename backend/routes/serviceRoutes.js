const express = require('express');
const router = express.Router();

const sampleServices = [
  { id: 1, name: 'Oil Change', durationHours: 1, price: 25 },
  { id: 2, name: 'Brake Service', durationHours: 2, price: 120 }
];

router.get('/', (req, res) => res.json(sampleServices));
router.get('/my-services', (req, res) => res.json(sampleServices)); // adjust auth/filtering later

module.exports = router;
