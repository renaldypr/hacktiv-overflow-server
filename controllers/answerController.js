const Answer = require('../models/answer');
const Question = require('../models/question');
const kue = require('kue');
const queue = kue.createQueue();

module.exports = {
  showAll: function(req,res) {
    Answer.find()
      .populate('userId')
      .exec((err, answers) => {
      if(!err) {
        res.status(200).json({
          message: 'find all answers success!',
          data: answers
        })
      } else {
        res.status(500).json({
          message: err
        })
      }
    })
  },
  create: function(req,res) {
    Answer.create({
      userId: req.decoded.id,
      content: req.body.content,
      votes: []
    })
      .then(answer => {
        Question.findByIdAndUpdate(
          req.body.questionId,
          {$push: {"answers": answer}},
          {safe: true, upsert: true, new : true},
          function(err, model) {
            if(!err) {
              queue.create('email', {
                title: 'Someone has answered your question, ' + req.body.name + '!',
                to: req.body.email,
                name: req.body.name,
                template: `<h3><b>Hello, ${req.body.name}! Your question has been answered!</b></h3>
                <img style="width: 50px; height: 50px;" src="https://d1qb2nb5cznatu.cloudfront.net/startups/i/32728-274244db60c65e1cc32abb4c54a2c582-medium_jpg.jpg?buster=1442602512"/>
                <p>Check out your question's thread now!</p>
                <a href="#">Click here to go there immediately.</a>
                <hr>
                <p>Sincerely,</p>
                <p>Your Hacktiv-Overflow Team</p>`
              })          
                .save( function(err){
                if( !err ) {
                  res.status(201).json({
                    message: 'answer created successfully!',
                    data: answer
                  })
                } else {
                  console.log(err)
                  res.status(500).json({
                    message: err
                  })
                }
              })
            } else {
              res.status(500).json({
                message: err
              })
            }
          }
        )
      })
      .catch(err => {
        res.status(500).json({
          message: err
        })
      })
  },
  edit: function(req,res) {
    Answer.find({ _id: req.body.id }, function(err,answer) {
      if(!err) {
        if (answer.length !== 0) {
          if (answer[0].userId == req.decoded.id) {
            answer[0].content = req.body.content
            answer[0].save()
            res.status(200).json({
              message: 'answer edited successfully!',
              data: answer[0]
            })
          } else {
            res.status(500).json({
              message: 'you are not the owner of this answer!'
            })
          }
        } else {
          res.status(404).json({
            message: 'the requested answer is not available'
          })
        }    
      } else {
        res.status(500).json({
          message: err
        })
      }
    })
  },
  vote: function(req,res) {
    Answer.findOne({ _id: req.params.answerId }, function(err, answer) {
      if(!err) {
        if (answer) {
          if (answer.userId._id == req.decoded.id) {
            res.status(403).json({
              message: 'you cannot vote your own answer!'
            })
          } else {
            let sudahVote = false
            for (var i = 0; i < answer.votes.length; i++) {
              if (answer.votes[i].userId === req.decoded.id) {
                sudahVote = true
                break
              }
            }
  
            if (req.params.statusVote === 'upvote') {
              var voteStatus = true
            } else if (req.params.statusVote === 'downvote') {
              var voteStatus = false
            }
  
            if (sudahVote) {
              if (answer.votes[i].vote === voteStatus) {
                answer.votes.splice(i, 1)
                answer.update({
                  votes: answer.votes
                }).then((a) => {
                  res.status(200).json({
                    message: 'answer\'s vote removed!',
                    data: a
                  })
                })
              } else {
                answer.votes[i].vote = voteStatus
                answer.update({
                  votes: answer.votes
                }).then((a)=>{
                  res.status(200).json({
                    message: 'answer\'s vote updated successfully!',
                    data: a
                  })
                })
              }
            } else {
              let voteObj = {
                userId: req.decoded.id,
                vote: voteStatus
              }
              Answer.findByIdAndUpdate(
                req.params.answerId,
                {$push: {"votes": voteObj}},
                {safe: true, upsert: true, new : true},
                function(err, model) {
                  if(!err) {
                    res.status(201).json({
                      message: 'answer voted successfully!'
                    })
                  } else {
                    res.status(500).json({
                      message: err
                    })
                  }
                }
              )
            }        
          }
        } else {
          res.status(404).json({
            message: 'the requested answer is not available'
          })
        }      
      } else {
        res.status(500).json({
          message: err
        })
      }
    })
  }
}