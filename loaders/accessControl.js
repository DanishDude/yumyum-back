import jwt from 'jsonwebtoken';
import { privateKey } from '../conf.json';

module.exports.hydrateReq = async (req, res, next) => {
  try {
    if (req.token) {
      const decoded = jwt.decode(req.token, privateKey);
      if (decoded) {
        req.user = {};
        req.user.id = decoded.id;
        req.user.email = decoded.email;
        console.log('USER', req.user);
      } else {
          console.log('No user detected');
      };
    };
  } catch (err) {
    next(err);
  }
  return next();
};
