const User = require('../models/user');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const axios = require('axios');
const kue = require('kue');
const queue = kue.createQueue();
const nodemailer = require('nodemailer');

module.exports = {
  showAll: function(req,res) {
    User.find((err, users) => {
      if(!err) {
        res.status(200).json({
          message: 'find all user success!',
          data: users
        })
      } else {
        res.status(500).json({
          message: err
        })
      }
    });
  },
  create: function(req,res) {
    User.create({
      name: req.body.name,
      password: req.body.password,
      email: req.body.email,
      isLoginViaFB: false
    })
      .then(user => {
        queue.create('email', {
          title: 'Welcome to Hacktiv-Overflow, ' + user.name + '!',
          to: user.email,
          name: user.name,
          template: `<h3><b>Hello, ${user.name}! Welcome to Hacktiv-Overflow!</b></h3>
          <img style="width: 50px; height: 50px;" src="https://d1qb2nb5cznatu.cloudfront.net/startups/i/32728-274244db60c65e1cc32abb4c54a2c582-medium_jpg.jpg?buster=1442602512"/>
          <p>You are now joining the best community on the internet!</p>
          <p>Please feel free to start asking questions, and helping out other members of the community!</p>
          <hr>
          <p>Have fun!</p>
          <p>Sincerely,</p>
          <p>Your Hacktiv-Overflow Team</p>`
        })          
          .save( function(err){
          if( !err ) {
            res.status(201).json({
              message: 'user created successfully!',
              data: user
            })
          } else {
            console.log(err)
            res.status(500).json({
              message: err
            })
          }
        })
      })
      .catch(err => {
        res.status(500).json({
          message: err
        })
      })
  },
  erase: function(req,res) {
    User.deleteOne({ _id: req.decoded.id }, function (err, data) {
      if(!err) {
        res.status(200).json({
          message: 'user deleted successfully'
        })
      } else {
        res.status(500).json({
          message: err
        })
      }
    });
  },
  edit: function(req,res) {
    User.findOne({ _id: req.decoded.id }, function(err,user) {
      if(!err) {
        if(user) {
          user.name = req.body.name
          user.password = req.body.password
          user.save()
          res.status(200).json({
            message: 'user edited successfully!',
            data: user.name
          })
        } else {
          res.status(404).json({
            message:'user not found!'
          })
        }
      } else {
        res.status(500).json({
          message: err
        })
      }
    })
  },
  login: function(req,res) {
    User.find({ email: req.body.email }, function (err, user) {
      if (!err) {
        if (user.length !== 0) {
          if (user[0].isLoginViaFB) {
            res.status(500).json({
              message: 'Please sign in via Facebook!'
            })
          } else {
            if (bcrypt.compareSync(req.body.password, user[0].password)) {
              jwt.sign({id: user[0]._id, name: user[0].name, email:user[0].email}, process.env.JWT_KEY, function(err, token) {
                if (!err) {
                  res.status(200).json({
                    user: user[0].name,
                    email: user[0].email,
                    token: token
                  })
                } else {
                  res.status(500).json({
                    message: 'jwt.sign error'
                  })
                }
              });
            } else {
              res.status(500).json({
                message: 'wrong password!'
              })
            }   
          }
        } else {
          res.status(500).json({
            message: 'you have not registered!'
          })
        }
      } else {
        res.status(500).json({
          message: err
        })
      }
    })
  },
  loginFB: function(req,res) {
    axios({
      method:'get',
      url:`https://graph.facebook.com/me?fields=id,name,email&access_token=${req.headers.tokenfb}`,
    })
      .then(function(response) {
        User.find({email: response.data.email}, function(err, userData) {
          if (!err) {
            if(userData.length === 0) {
              let newUser = new User({
                name: response.data.name,
                password: 'defaultpassword',
                email: response.data.email,
                isLoginViaFB: true
              })
              newUser.save((err, user) => {
                if (!err) {
                  queue.create('email', {
                    title: 'Welcome to Hacktiv-Overflow, ' + user.name + '!',
                    to: user.email,
                    name: user.name,
                    template: `<h3><b>Hello, ${user.name}! Welcome to Hacktiv-Overflow!</b></h3>
                    <img style="width: 50px; height: 50px;" src="https://d1qb2nb5cznatu.cloudfront.net/startups/i/32728-274244db60c65e1cc32abb4c54a2c582-medium_jpg.jpg?buster=1442602512"/>
                    <p>You are now joining the best community on the internet!</p>
                    <p>Please feel free to start asking questions, and helping out other members of the community!</p>
                    <hr>
                    <p>Have fun!</p>
                    <p>Sincerely,</p>
                    <p>Your Hacktiv-Overflow Team</p>`
                  })          
                    .save( function(err){
                    if( !err ) {
                      res.status(201).json({
                        message: 'user created successfully!',
                        data: user
                      })
                    } else {
                      console.log(err)
                      res.status(500).json({
                        message: err
                      })
                    }
                  })
                } else {
                  res.status(500).json(err)
                }
              })
            } else {
              User.findOne({ email: response.data.email }, function(err,user) {
                if(!err) {
                  if(user) {
                    jwt.sign({id: user._id, name: user.name, email: user.email}, process.env.JWT_KEY, (err, token) => {
                      res.status(200).json({
                        user: user.name,
                        email: user.email,
                        token_jwt: token
                      })
                    })
                  } else {
                    res.status(404).json({
                      message:'user not found!'
                    })
                  }
                } else {
                  res.status(500).json({
                    message: err
                  })
                }
              })
            }
          } else {
            res.status(500).json(err);
          }
        })
      })
      .catch(err => {
        res.status(500).json(err)
      })
  }
}