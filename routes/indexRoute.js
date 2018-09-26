const router = require('express').Router();

router.get('/', (req,res) => {
  res.send('Welcome to hacktiv-overflow!')
})

module.exports = router;