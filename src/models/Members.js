const mongoose = require('mongoose');

const { Schema } = mongoose;

const MemberSchema = new Schema({
  firstname: {
    type: String,
    required: true,
  },
  lastname: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  dob: {
    type: Date
  },
  nin: {
    type: String
  },
  phone: {
    type: String
  },
  tier:{
    type: String,
    enum: ['1', '2', '3'],
    default: '1'
  },
  emailStatus: {
    type: String,
    enum: ['verified', 'unverified'],
    default: 'unverified'
  },
  otps: [{
    type: Schema.Types.ObjectId,
    ref: 'Otp'
  }],
  twoFactor: {
    type: Boolean,
    default: true
  },
  image: {
    type: String,
  },
  role: {
    type: Array,
    default: ['user']
  },
  profilePicture: { type: mongoose.Schema.Types.ObjectId, ref: 'Attachment' },
  wallets: [
    { type: mongoose.Schema.Types.ObjectId, ref: 'Wallet' }
  ],
  createdAt: {
    type: Date,
    default: Date.now,
  }
},
);

MemberSchema.virtual('status').get(function() {
  if(this.tier === '3'){
    return 'platinum'
  }
  if(this.tier === '2'){
    return 'gold'
  }
  if(this.tier === '1'){
    return 'silver'
  }
})

const Member = mongoose.model('Member', MemberSchema);

module.exports = Member;