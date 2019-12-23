import jwt from 'jsonwebtoken';
import { privateKey } from '../conf.json';

module.exports.hydrateReq = async (req, res, next) => {
  try {
    if (req.token) {
      const decoded = jwt.decode(req.token, privateKey);
      req.user = {};
      req.user.id = decoded.id;
      req.user.email = decoded.email;
      console.log(`INFO - ID: ${req.user.id}, EMAIL: ${req.user.email}`);
    }
  } catch (err) {
    next(err);
  }
  return next();
};
