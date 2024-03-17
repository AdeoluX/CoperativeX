const mongoose = require('mongoose');

const { Schema } = mongoose;

const TransactionSchema = new Schema({
    wallet_id: { type: Schema.Types.ObjectId, ref: 'Wallet' },
    member: { type: Schema.Types.ObjectId, ref: 'Member' },
    amount: Number,
    status: {
        type: String,
        enum: ['pending', 'success', 'failed', 'abadoned'],
        default: 'pending',
        required: true
    },
    type: {
        type: String,
        enum: ['DR', 'CR'],
        required: true
    },
    descriptions: String,
    createdAt: {
        type: Date,
        default: Date.now,
    },
    reference: String,
    currency: {
        type: String,
        enum: ['NGN', 'USD'],
        default: 'NGN'
    },
 },
);

const Transaction = mongoose.model('Transaction', TransactionSchema);

module.exports = Transaction;