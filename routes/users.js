const express = require('express');
const router = express.Router();

router.use('*', function(req, res, next) {
  const data = { data: { name: "test"} };
  res.json(data);
});

module.exports = router;