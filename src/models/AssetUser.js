const mongoose = require('mongoose');

const { Schema } = mongoose;

const AssetUserSchema = new Schema({
    member: {
        type: Schema.Types.ObjectId,
        ref: 'Member',
        required: true
      },
    asset: {
        type: Schema.Types.ObjectId,
        ref: 'Asset',
        required: true
      },
    tokenOwned: {
        type: Number,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    }
    },
);

const AssetUser = mongoose.model('AssetUser', AssetUserSchema);

module.exports = AssetUser;