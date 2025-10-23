import mongoose from 'mongoose';

const statsSchema = new mongoose.Schema({
  totalPledges: {
    type: Number,
    default: 0
  },
  totalCertificates: {
    type: Number,
    default: 0
  },
  totalUsers: {
    type: Number,
    default: 0
  },
  averageRating: {
    type: Number,
    default: 0
  },
  pledgesByCountry: {
    type: Map,
    of: Number,
    default: {}
  },
  pledgesByDate: {
    type: Map,
    of: Number,
    default: {}
  },
  lastUpdated: {
    type: Date,
    default: Date.now
  }
});

// Create or update method
statsSchema.statics.createOrUpdate = async function(data) {
  // There should only be one stats document
  const stats = await this.findOne();
  if (stats) {
    return await this.findOneAndUpdate({}, data, { new: true });
  } else {
    return await this.create(data);
  }
};

export default mongoose.model('Stats', statsSchema);