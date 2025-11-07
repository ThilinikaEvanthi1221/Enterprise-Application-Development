import mongoose from 'mongoose';

const RatingSchema = new mongoose.Schema(
  {
    customerName: { type: String, required: true, index: true },
    vehicleNo: { type: String, required: true, index: true },
    serviceType: { type: String, required: true, index: true },
    date: { type: Date, required: true, index: true },
    overallRating: { type: Number, required: true, min: 1, max: 5 },
    serviceQuality: { type: Number, min: 1, max: 5, default: 0 },
    timeliness: { type: Number, min: 1, max: 5, default: 0 },
    professionalism: { type: Number, min: 1, max: 5, default: 0 },
    pricingTransparency: { type: Number, min: 1, max: 5, default: 0 },
    comment: { type: String, default: '' }
  },
  { timestamps: true }
);

export default mongoose.model('Rating', RatingSchema);


