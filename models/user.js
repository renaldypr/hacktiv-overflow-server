const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const bcrypt = require('bcryptjs');

var userSchema = new Schema({
  name: {
    type: String,
    required: [true, 'Please input your name!']
  },
  password: {
    type: String, 
    required: [true, 'Password is required!'], 
    validate: {
      validator: function(p) {
          if(p.length <= 4) return false
      }
    }
  },
  email: {
    type: String,
    unique : true,
    required: [true, 'Please input your email!'],
  },
  isLoginViaFB: {
    type: Boolean
  }
}, {
  timestamps: true
});

userSchema.pre('save', function(next) {
  this.password = bcrypt.hashSync(this.password, 8);
  next();
});

const User = mongoose.model('User', userSchema);

module.exports = User;