const mongoose = require('mongoose');

const { Schema } = mongoose;

const WalletSchema = new Schema({
    member: {
        type: Schema.Types.ObjectId,
        ref: 'Member'
    },
    ledger_balance: {
        type: Number,
        default: 0
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
    transactions: [{
        type: Schema.Types.ObjectId,
        ref: 'Transaction'
    }],
    currency: {
        type: String,
        enum: ['NGN', 'USD'],
        default: 'NGN'
    },
    
 },
 {
    toObject: { virtuals: true },
    toJSON: { virtuals: true }
  }
);

WalletSchema.virtual('availableBalance').get(function() {
    const amount = 
    this.ledger_balance 
    - this.transactions.filter(t => t.status === 'pending' && t.type === 'DR').reduce((sum, transaction) => sum + transaction.amount, 0)
    return amount;
});

const Wallet = mongoose.model('Wallet', WalletSchema);

module.exports = Wallet;