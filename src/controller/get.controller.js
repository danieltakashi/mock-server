import HttpStatus from 'http-status-codes';
import { wrapperIndex } from '../lib/dataHandler.js';

export const get = (req, res) => {
  try {
    const data = wrapperIndex(req.originalUrl);

    res.status(HttpStatus.OK).json(data);
  } catch (error) {
    res.status(HttpStatus.BAD_REQUEST).json({
      code: HttpStatus.BAD_REQUEST,
      data: {},
      message: error
    });
  }
};

export default get;
