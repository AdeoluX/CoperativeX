const mongoose = require('mongoose');

const { Schema } = mongoose;

const WalletSchema = new Schema({
    member_id: {
        type: String,
    },
    balance: {
        type: Number,
        default: 0
    },
    createdAt: {
        type: Date,
        default: Date.now,
    }
 },
);

const Wallet = mongoose.model('Wallet', WalletSchema);

module.exports = Wallet;