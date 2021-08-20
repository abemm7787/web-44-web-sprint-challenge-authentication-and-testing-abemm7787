const Users = require("./model");

exports.validateUser = (req, res, next) => {
  const { username, password } = req.body;
  if (username && password) {
    next();
  } else {
    res.status(401).json({
      message: "username and password required",
    });
  }
};

exports.usernameAvail = (req, res, next) => {
  const { username } = req.body;
  Users.getBy(username)
    .then((user) => {
      if (user) {
        res.status(422).json({
          message: "username taken",
        });
      } else {
        next();
      }
    })
    .catch((err) => {
      res.status(500).json(err);
    });
};

exports.usernameExists = (req, res, next) => {
  const { username } = req.body;
  Users.getBy(username)
    .then((user) => {
      if (user) {
        next();
      } else {
        res.status(400).json({
          message: "invalid credentials",
        });
      }
    })
    .catch((error) => {
      res.status(500).json(error);
    });
};

exports.checkPasswordLength = (req, res, next) => {
  const { username, password } = req.body;
  if ((!password && !username) || (!password.length && !username.length < 7)) {
    next();
  } else {
    next({ status: 422, message: "Password must be long than 3 chars" });
  }
};

