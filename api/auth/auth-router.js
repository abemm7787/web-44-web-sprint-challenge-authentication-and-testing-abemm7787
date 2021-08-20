const router = require('express').Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const JWT_SECRET = require('./secrets');
const Users = require('./model');
const { validateUser,usernameAvail , usernameExists}  = require('./middleware');

router.post('/register', validateUser, usernameAvail, (req, res, next) => {
  
  const {username , password} =  req.body
  const hash = {username, password: bcrypt.hashSync(password, 8)};
 
  Users.add(hash)
    .then(users => {
      res.status(201).json(users);
    })
    .catch(errors => {
   next(errors)
    });

});

router.post('/login', validateUser, usernameExists,  async (req, res) => {
 

   const  {username, password} = req.body
  
  Users.getBy(username , password)
    .then(user => {
      const Valid = bcrypt.compareSync( password, user.password);
      if (!Valid) {
        console.log(password)
        res.status(400).json({
          message: 'invalid credentials'
        });
      } else {
       const payload = {
            ...user,
            password: undefined
          };
          const options = {
            expiresIn: '1d'
          };
          const token = jwt.sign(payload, JWT_SECRET, options);
          res.json({
            message: `welcome back my friend, ${user.username}`,
            token
        });
      }
    });

  
});

module.exports = router;