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
      delete user.password;
      console.log('USER ', user);
      res.status(201).json({ user, token });
    }
  });
});

router.post('/login', (req, res) => {
  passport.authenticate('local', (err, user) => {
    console.log(user);
    
    if (err) {
      console.log(err);
      return res.sendStatus(500);
    }; 

    if (!user) {
      return res.status(401).send('user not found');
    }; 
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
  try {
    if (!req.user) return res.status(403).send('unauthorised');

      const { id } = req.user;
      console.log('BODY ' + JSON.stringify(req.body));

      connection.query(`UPDATE user SET ? WHERE id = ${id}`, [req.body, id], (err, results) => {
        if (results.serverStatus === 2 && results.affectedRows > 0) {
          res.status(200).send(`user ${id} updated`);
        } else {
          console.log(err);
          res.status(500).json(err);
        }
      });
  } catch (err) {
    next(err);
  }
});

router.put('/user/toto', (req, res, next) => {
  passport.authenticate('local', async (err, user) => {
    console.log(user);
      
      if (err) return res.status(500).send(err);
      if (!user) return res.status(401).send('user not found');

      console.log('USER ' + JSON.stringify(user));
      
      if (!req.body.newPassword) return res.status(400).send('newPassword not provided')

      const generateNewUser = (userInfo, data) => {
        return {
          ...userInfo,
          ...data,
          password: bcrypt.hash(data.newPassword, 10)
        };
      };

    const newUser = await generateNewUser(user, req.body);


    delete newUser.newPassword;

    console.log('here ' + JSON.stringify(newUser));
    console.log(req.body);
    
    const { id } = req.user;
    
    connection.query(`UPDATE user SET ? WHERE id = ${id}`, [newUser, id], (err, results) => {
      if (err) {
        console.log(err);
        return res.status(500).send(err);
      } else 
      if (results.serverStatus === 2 && results.affectedRows === 1) {
        const token = jwt.sign(user, privateKey);
        delete newUser.password;
        console.log('newUser ' + newUser);
        
        return res.status(200).json({newUser, token});
      } else {
        console.log(err);
        return res.status(500).send('Ah snap');
      };
    });

    return res.status(200).send(req.body);
  })(req, res, next);
});

router.put('/user/password', passport.authenticate('local', (err, user) => {
      
      console.log(user);
      
      if (err) {
        console.log(err);
        return res.sendStatus(500);
      }; 
  
      if (!user) return res.status(401).send('user not found');

      console.log('USER ' + user);
      //res.status(200).send(user);
      
      
      
      if (!req.body.newPassword) return res.status(400).send('newPassword not provided')
      
      const newUser = {
        ...user,
        ...req.body,
        password: bcrypt.hash(req.body.newPassword, 10)
      };

      delete newUser.newPassword;
  
      console.log('here ' + JSON.stringify(newUser));
      console.log(req.body);
      
      /* const { id } = req.user;
      
      connection.query(`UPDATE user SET ? WHERE id = ${id}`, [newUser, id], (err, results) => {
        if (results.serverStatus === 2 && results.affectedRows > 0) {
          const token = jwt.sign(user, privateKey);
          delete newUser.password;
          console.log('newUser ' + newUser);
          
          res.status(200).json({newUser, token});
        } else {
          console.log(err);
          res.status(500).json(err);
        };
      }); */

      return res.status(200).send('next step');

    }), ((req, res, user) => {
      const newUser = {
        ...user,
        ...req.body,
        password: bcrypt.hash(req.body.newPassword, 10)
      };

      delete newUser.newPassword;
  
      console.log('here ' + JSON.stringify(newUser));
      console.log(req.body);
      
      const { id } = req.user;
      
      connection.query(`UPDATE user SET ? WHERE id = ${id}`, [newUser, id], (err, results) => {
        if (results.serverStatus === 2 && results.affectedRows > 0) {
          const token = jwt.sign(user, privateKey);
          delete newUser.password;
          console.log('newUser ' + newUser);
          
          res.status(200).json({newUser, token});
        } else {
          console.log(err);
          res.status(500).json(err);
        };
      });
      
    })
  
)

module.exports = router;
