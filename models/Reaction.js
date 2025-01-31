const mongoose = require('mongoose');
const { Schema } = mongoose;

const ReactionSchema = new Schema({
  reactionId: {
    type: Schema.Types.ObjectId,
    default: () => new mongoose.Types.ObjectId()
  },
  reactionBody: {
    type: String,
    required: true,
    maxlength: 280
  },
  username: {
    type: String,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now()
  }
},
{
  toJSON: {
    getters: true,
    virtuals: true
  },
  id: false
});

module.exports = ReactionSchema;