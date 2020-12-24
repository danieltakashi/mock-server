import express from 'express';
import HttpStatus from 'http-status-codes';
import get  from '../controller/get.controller.js';
import save from '../controller/post.controller.js';

const router = express.Router();

export const routes = () => {
  router.use('*', (req, res) => {
    let data = {};
    let message = '';
    let code = HttpStatus.NOT_IMPLEMENTED;

    switch (req.method) {
      case 'GET':
        data = get(req);
        code = HttpStatus.OK;
        message = 'User fetched successfully';
        break;

      case 'POST':
        code = HttpStatus.ACCEPTED;
        message = save(req.method, req);
        break;

      case 'PUT':
        code = HttpStatus.ACCEPTED;
        message = save(req.method, req);
        break;

      case 'DELETE':
        code = HttpStatus.NOT_IMPLEMENTED;
        message = 'Method [' + req.method + ']: Not Implemented';
        break;

      default:
        code = HttpStatus.BAD_REQUEST;
        message = 'Method [' + req.method + ']: Not Supported';
    }

    res.status(code).json({ code, data, message });
  });

  return router;
};

export default routes;
