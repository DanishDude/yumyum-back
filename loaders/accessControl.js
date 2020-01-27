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
        req.user.picture = decoded.picture;
        req.user.displayname = decoded.displayname;
        req.user.firstname = decoded.firstname;
        req.user.lastname = decoded.lastname;
        console.log(`USER ID: ${req.user.id} | EMAIL: ${req.user.email}`)
      } else {
          console.log('Token not recognised');
      };
    };
  } catch (err) {
    next(err);
  }
  return next();
};
