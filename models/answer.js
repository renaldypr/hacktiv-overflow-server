const mongoose = require('mongoose');
const Schema = mongoose.Schema;

var answerSchema = new Schema({
  userId: {
    type: Schema.Types.ObjectId, ref: 'User',
    required: true
  },
  content: {
    type: String,
    required: [true, 'Please input your answer!'],
  },
  votes: []
}, {
  timestamps: true
});

const Answer = mongoose.model('Answer', answerSchema);

module.exports = Answer;