import HttpStatus from 'http-status-codes';
import { wrapperIndex } from '../lib/dataHandler.js';

export const get = (req, res) => {
  try {
    const data = wrapperIndex(req.originalUrl);
    res.status(HttpStatus.OK).json(data);
  } catch (error) {
    res.status(HttpStatus.BAD_REQUEST).json({
      code: HttpStatus.OK,
      data: data,
      message: 'User fetched successfully'
    });
  }
};

export default get;
