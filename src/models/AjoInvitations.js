const mongoose = require('mongoose');

const { Schema } = mongoose;

const AjoInvitationsSchema = new Schema({
  member: {
    type: Schema.Types.ObjectId,
    ref: 'Member',
    required: true
  },
  ajo: {
    type: Schema.Types.ObjectId,
    ref: 'Ajo',
    required: true
  },
  response: {
    type: String,
    enum: ['rejected','accepted', 'pending'],
    default: 'pending'
  }
}
);

const AjoInvitations = mongoose.model('AjoInvitations', AjoInvitationsSchema);

module.exports = AjoInvitations;