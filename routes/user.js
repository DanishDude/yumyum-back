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
    connection.query('SELECT id, email, password FROM user WHERE email = ?', [email], (err, results) => {
      if (err) {
        return done(err, false);
      } else if (results.length === 0) {
        return done(null, false);
      } else if (bcrypt.compareSync(password, results[0].password)) {
        const user = {
          id: results[0].id,
          email: results[0].email,
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
  secretOrKey: privateKey, // 'lc_passport',
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
      console.log('USER ', user);
      const token = jwt.sign(user, privateKey/*  'lc_passport' */);
      console.log('hello');
      res.status(201).json({ email: user.email, token });
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
    
    const token = jwt.sign(user, privateKey/*  'lc_passport' */);
    console.log(token);
    return res.json({ user, token });
  })(req, res);
});

router.get('/toto', (req, res, next) => {
  try {
    const token = req.token;
    const yoyo = jwt.decode(token);
    console.log('yoyo: ', yoyo);

    const jojo = jwt.verify(token, privateKey/*  'lc_passport' */);
    console.log('jojo: ', jojo);

    res.status(200).send('hello');
  } catch (err) {
    next(err);
  }
});

module.exports = router;
