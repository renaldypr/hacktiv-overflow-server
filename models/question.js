const mongoose = require('mongoose');
const Schema = mongoose.Schema;

var questionSchema = new Schema({
  title: {
    type: String,
    required: [true, 'Please input a title!']
  },
  userId: {
    type: Schema.Types.ObjectId, ref: 'User',
    required: true
  },
  content: {
    type: String,
    required: [true, 'Please input your content!'],
  },
  answers: [{
    type: Schema.Types.ObjectId, ref: 'Answer',
  }],
  votes: []
}, {
  timestamps: true
});

const Question = mongoose.model('Question', questionSchema);

module.exports = Question;