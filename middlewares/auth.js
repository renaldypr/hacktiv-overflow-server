const jwt = require('jsonwebtoken');
const User = require('../models/user');

module.exports = {
  auth: function(req,res,next) {
    jwt.verify(req.headers.token, process.env.JWT_KEY, function(err, decoded) {
      if (!err) {
        User.findById(decoded.id, function(err, user) {
          if (!err) {
            if (user) {
              req.decoded = decoded
              next()
            } else {
              res.status(500).json({
                message: 'invalid token! user not found!'
              })
            }
          } else {
            console.log(err)
            res.status(500).json({
              message: err
            })
          }
        })
      } else {
        console.log(err)
        res.status(500).json({
          message: err
        })
      }
    });
  }
}