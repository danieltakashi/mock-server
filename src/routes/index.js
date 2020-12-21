import express from 'express';
const router = express.Router();
import get from '../controller/get.controller.js';
import save from '../controller/post.controller.js';

export const routes = () => {
  router.use('*', (req, res) => {
    var data, msg;
    switch (req.method) {
      case 'GET':
        data = get(req, res);
        res.json(data);
        break;
      case 'POST':
      case 'PUT':
        msg = save(req.method, req);
        res.json(msg);
        break;
      // case 'DELETE':
      //   console.log(req.method)
      //   break;
      default:
        res
          .status(500)
          .json({ message: 'Method [' + req.method + ']: not Supported' });
    }
    res.status(HttpStatus.OK).json({
      code: HttpStatus.OK,
      data: data,
      message: 'User fetched successfully'
    });
  });

  return router;
};
export default routes;
