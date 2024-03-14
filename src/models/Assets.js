const mongoose = require('mongoose');

const currencyEnum = ['NGN', 'USD']
// Asset model
const assetSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  description: {
    type: String,
  },
  value: {
    type: Number,
    required: true
  },
  currency: {
    type: String,
    enum: currencyEnum,
    default: 'NGN'
  },
  status: {
    type: String,
    enum: ['approved', 'unapproved'],
    default: 'unapproved'
  },
  minimumAmount: {
    type: Number,
    required: true
  },
  amountPaid: {
    type: Number,
    default: 0
  },
  docs: [
    { type: mongoose.Schema.Types.ObjectId, ref: 'Attachment' }
  ],
  images: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Attachment' }],
  createdAt: {
    type: Date,
    default: Date.now,
  } 
},{
  toObject: { virtuals: true },
  toJSON: { virtuals: true }
});

assetSchema.virtual('availableTokens').get(function() {
  return Number((this.value - this.amountPaid)/this.minimumAmount);
});


const Asset = mongoose.model('Asset', assetSchema);

module.exports = Asset