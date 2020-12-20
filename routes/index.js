const express = require('express');
const router = express.Router();
const payload = require('../lib/dataHandler')

router.use('*', function(req, res, next) {
  var data = payload(req.originalUrl);
  res.json(data);
});

module.exports = router;