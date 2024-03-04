const mongoose = require('mongoose');

const { Schema } = mongoose;

const BankSchema = new Schema({
  bankCode: {
    type: String,
    required: true,
  },
  bankName: {
    type: String,
    required: true,
  },
  accountNumber: {
    type: String,
    required: true,
  },
  nameOnAccount: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  }
}
);

const Bank = mongoose.model('Bank', BankSchema);

module.exports = Bank;