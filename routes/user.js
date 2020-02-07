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
    connection.query(`SELECT id, email, picture, displayname, firstname, lastname, password
                      FROM user WHERE email = ?`, [email], (err, results) => {
      if (err) {
        return done(err, false);
      } else if (results.length === 0) {
        return done(null, false);
      } else if (bcrypt.compareSync(password, results[0].password)) {
        const user = {
          id: results[0].id,
          email: results[0].email,
          picture: results[0].picture,
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

router.post('/signup', async (req, res, next) => {
  try {
    const allowed = ['email', 'displayname', 'firstname', 'lastname', 'password'];
    const regex = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

    for (const [key, value] of Object.entries(req.body)) {
      if (!allowed.includes(key)) delete req.body[key];

      if (key === 'email' && (!regex.test(String(value).toLowerCase()) || value === ''))
        {return res.status(400).send('invalid email format');}

      if (key === 'displayname' && (value.length < 1 || value.length > 15))
        {return res.status(400).send('displayname must have 1-15 characters');}
    }

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
        delete user.password;
        console.log('USER ', user);
        res.status(201).json({ user, token });
      }
    });
  } catch (err) {
    next(err);
  }
});

router.post('/login', (req, res) => {
  passport.authenticate('local', (err, user) => {
    console.log(user);

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
    }
  } catch (err) {
    next(err);
  }
});

router.put('/user', (req, res, next) => {
  if (!req.user) res.status(403).send('unauthorized');

  passport.authenticate('local', (err, user) => {
    if (err) return res.status(500).send(err);
    if (!user) return res.status(401).json('user not found');

    for (const key of Object.keys(user)) {
      if (!(key === 'id' || key === 'email')) user[key] = req.body[key];
    }

    if (req.body.newPassword) user.password = bcrypt.hashSync(req.body.newPassword, 10);

    connection.query(`UPDATE user SET ? WHERE id = ${user.id}`, [user], (error) => {
      if (error) {
        console.log(error);
        return res.status(500).send(error);
      }
      delete user.password;
      const token = jwt.sign(user, privateKey);
      return res.status(200).json({ user, token });
    });
  })(req, res, next);
});

module.exports = router;
