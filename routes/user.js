import express from 'express';
import { Strategy as LocalStrategy } from 'passport-local';
import { ExtractJwt, Strategy as JwtStrategy } from 'passport-jwt';
import passport from 'passport';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import connection from '../conf';
import { privateKey } from '../conf.json';

const router = express.Router();

passport.use('local', new LocalStrategy({
  usernameField: 'email',
  passwordField: 'password',
  session: false,
}, (email, password, done) => {
  try {
    connection.query(`SELECT id, email, displayname, firstname, lastname, password
                      FROM user WHERE email = ?`, [email], (err, results) => {
      if (err) {
        return done(err, false);
      } else if (results.length === 0) {
        return done(null, false);
      } else if (bcrypt.compareSync(password, results[0].password)) {
        const user = {
          id: results[0].id,
          email: results[0].email,
          displayname: results[0].displayname,
          firstname: results[0].firstname,
          lastname: results[0].lastname
        };
        return done(null, user);
      }
      return done(null, false);
    });
  } catch (err) {
    throw new Error(err);
  }
}));

passport.use(new JwtStrategy({
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: privateKey,
}, (jwtPayload, cb) => cb(null, jwtPayload)));

router.post('/signup', (req, res) => {
  console.log('REQ.BODY ', req.body);

  const user = {
    ...req.body,
    password: bcrypt.hashSync(req.body.password, 10),
  };

  connection.query('INSERT INTO user SET ?', user, (err) => {
    if (err) {
      console.log(err);
      res.status(500).send(err);
    } else {
      const token = jwt.sign(user, privateKey);
      delete user.password
      console.log('USER ', user);
      res.status(201).json({ user, token });
    }
  });
});

router.post('/login', (req, res) => {
  passport.authenticate('local', (err, user) => {
    if (err) {
      console.log(err);
      return res.sendStatus(500);
    }
    if (!user) {
      return res.status(401).send('user not found');
    }
    console.log('USER: ', user);
    const token = jwt.sign(user, privateKey);
    return res.json({ user, token });
  })(req, res);
});

router.get('/user', (req, res, next) => {
  try {
    if (req.user) {
      res.status(200).send(req.user);
    } else {
      res.status(404).send('user not found');
    };
  } catch (err) {
    next(err);
  };
});

module.exports = router;
