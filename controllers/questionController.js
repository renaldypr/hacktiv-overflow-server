const Question = require('../models/question');

module.exports = {
  showAll: function(req,res) {
    Question.find()
      .populate('userId')
      .populate({
        path: 'answers',
        model: 'Answer',
        populate: {
            path: 'userId',
            model: 'User'
        }
      })
      .sort({createdAt: -1})
      .exec((err, questions) => {
      if(!err) {
        res.status(200).json({
          message: 'find all questions success!',
          data: questions
        })
      } else {
        res.status(500).json({
          message: err
        })
      }
    })
  },
  showOne: function(req,res) {
    Question.findOne({ _id: req.params.id })
      .populate('userId')
      .populate({
        path: 'answers',
        model: 'Answer',
        populate: {
            path: 'userId',
            model: 'User'
        }
      })
      .exec((err, question) => {
      if(!err) {
        if(question) {
          res.status(200).json({
            message: 'find one question success!',
            data: question
          })
        } else {
          res.status(500).json({
            message: 'question not found!'
          })
        }
      } else {
        res.status(500).json({
          message: err
        })
      }
    })
  },
  create: function(req,res) {
    Question.create({
      title: req.body.title,
      userId: req.decoded.id,
      content: req.body.content,
      answers: [],
      votes: []
    })
      .then(question => {
        res.status(201).json({
          message: 'question created successfully!',
          data: question
        })
      })
      .catch(err => {
        res.status(500).json({
          message: err
        })
      })
  },
  erase: function(req,res) {
    Question.find({ _id: req.body.id }, function(err,question) {
      if(!err) {
        if (question.length !== 0) {
          if (question[0].userId == req.decoded.id) {
            Question.deleteOne({ _id: req.body.id }, function (err) {
              if(!err) {
                res.status(200).json({
                  message: 'question deleted successfully',
                })
              } else {
                res.status(500).json({
                  message: err
                })
              }
            })
          } else {
            res.status(403).json({
              message: 'you are not the owner of this question!'
            })
          }
        } else {
          res.status(404).json({
            message: 'the requested question is not available'
          })
        }    
      } else {
        res.status(500).json({
          message: err
        })
      }
    })
  },
  edit: function(req,res) {
    Question.findOne({ _id: req.body.id }, function(err, question) {
      if(!err) {
        if (question) {
          if (question.userId == req.decoded.id) {
            question.title = req.body.title
            question.content = req.body.content
            question.save()
            res.status(200).json({
              message: 'question edited successfully!',
              data: question
            })
          } else {
            res.status(500).json({
              message: 'you are not the owner of this question!'
            })
          }
        } else {
          res.status(404).json({
            message: 'the requested question is not available'
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
    Question.findOne({ _id: req.params.questionId }, function(err, question) {
      if(!err) {
        if (question) {
          if (question.userId._id == req.decoded.id) {
            res.status(403).json({
              message: 'you cannot vote your own question!'
            })
          } else {
            let sudahVote = false
            for (var i = 0; i < question.votes.length; i++) {
              if (question.votes[i].userId === req.decoded.id) {
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
              if (question.votes[i].vote === voteStatus) {
                question.votes.splice(i, 1)
                question.update({
                  votes: question.votes
                }).then((a) => {
                  res.status(200).json({
                    message: 'question\'s vote removed!',
                    data: a
                  })
                })
              } else {
                question.votes[i].vote = voteStatus
                question.update({
                  votes: question.votes
                }).then((a)=>{
                  res.status(200).json({
                    message: 'question\'s vote updated successfully!',
                    data: a
                  })
                })
              }
            } else {
              let voteObj = {
                userId: req.decoded.id,
                vote: voteStatus
              }
              Question.findByIdAndUpdate(
                req.params.questionId,
                {$push: {"votes": voteObj}},
                {safe: true, upsert: true, new : true},
                function(err, model) {
                  if(!err) {
                    res.status(201).json({
                      message: 'question voted successfully!'
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
            message: 'the requested question is not available'
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