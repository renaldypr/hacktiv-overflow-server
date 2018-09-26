require('dotenv').config()
const CronJob = require('cron').CronJob;
const kue = require('kue');
const queue = kue.createQueue();
const nodemailer = require('nodemailer');

new CronJob('30 * * * * *', function() {
  queue.process('email', function(job, done){
    var transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL,
        pass: process.env.PASSWORD
      }
    })
    const mailOptions = {
      from: 'hacktivoverflow.renaldy@gmail.com', // sender address
      to: job.data.to, // list of receivers
      subject: job.data.title, // Subject line
      html: job.data.template
    }
    transporter.sendMail(mailOptions, function (err, info) {
      if(err) {
        console.log(err)
      }
      else {
        console.log(info)
        done()
      }
    })
    job.on('complete', function(result) {
      job.remove(function(err){
        if (err) throw err;
        console.log('removed completed job #%d', job.id)
      })
    })
      .on('failed', function(errorMessage){
        job.remove(function(err){
          if (err) throw err;
          console.log('removed completed job #%d', job.id);
        })
    })
  })
}, null, true, 'America/Los_Angeles');