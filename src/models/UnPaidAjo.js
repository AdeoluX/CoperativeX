const mongoose = require('mongoose');

const { Schema } = mongoose;

const UnpaidAjoSchema = new Schema({
  member: {
    type: Schema.Types.ObjectId,
    ref: 'Member',
    required: true
  },
  amount: {
    type: Number,
    required: true,
  },
  collector: {
    type: Schema.Types.ObjectId,
    ref: 'Member',
    required: true
  },
  status: {
    type: Schema.Types.Boolean,
    enum: [false, true],
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now,
  }
}
);

const UnpaidAjo = mongoose.model('UnpaidAjo', UnpaidAjoSchema);

module.exports = UnpaidAjo;