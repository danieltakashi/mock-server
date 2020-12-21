const express = require('express');
const router = express.Router();
const get = require('../controller/get.controller');
const post = require('../controller/post.controller');

router.use('*', function (req, res, next) {
  let data;
  switch (req.method) {
    case 'GET':
      data = get(req.originalUrl);
      res.json(data);
      break;
    case 'POST':
    case 'PUT':
      data = post(req.method, req);
      res.json(data);
      break;
    // case 'DELETE':
    //   console.log(req.method)
    //   break;
    default:
      res.status(500).json({ message: 'Method [' + req.method + ']: not Supported' });
  }
});

module.exports = router;
