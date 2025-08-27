const session = require("express-session");
const User = require("../models/user");
const bcrypt = require("bcrypt");

exports.postlogOut = (req, res, next) => {
  req.session.destroy();
  res.redirect("/");
};

exports.getLogin = (req, res, next) => {
  let message = req.flash("error");
  if (message.length > 0) {
    message = message[0];
  } else {
    message = null;
  }
  res.render("login", {
    isLogged: req.session.isLogged,
    errorMessage: message,
  });
};

exports.postLogin = (req, res, next) => {
  User.findOne({ email: req.body.email })
    .then((user) => {
      if (user) {
        bcrypt.compare(req.body.password, user.password).then((doMatch) => {
          if (doMatch) {
            req.session.user = user;
            req.session.isLogged = true;
            req.session.save((err) => {
              if (err) {
                console.log(err);
              } else {
                return res.redirect("/");
              }
            });
          } else {
            req.flash("error", "Incorrect Password");
            return req.session.save((err) => {
              res.redirect("/login");
            });
          }
        });
      } else {
        req.flash("error", "Account with this email does not exist");
        return req.session.save((err) => {
          res.redirect("/login");
        });
      }
    })
    .catch((err) => {
      console.log(err);
    });
};

exports.getSignUP = (req, res, next) => {
  let message = req.flash("error");
  if (message.length > 0) {
    message = message[0];
  } else {
    message = null;
  }
  res.render("signup", {
    isLogged: req.session.isLogged,
    errorMessage: message,
  });
};

exports.postSignUp = (req, res, next) => {
  const password = req.body.password;
  const email = req.body.email;

  User.findOne({ $or: [{ email: email }, { userName: req.body.userName }] })
    .then((user) => {
      if (user) {
        req.flash("error", "Account with this email or UserName already exist");
        req.session.save((err) => {
          res.redirect("/signup");
        });
      } else {
        return bcrypt.hash(password, 12).then((hashedPassword) => {
          const user = new User({
            userName: req.body.userName,
            email: req.body.email,
            password: hashedPassword,
            groups: [],
          });
          user.save().then((result) => {
            res.redirect("/login");
          });
        });
      }
    })
    .catch((err) => {
      console.log(err);
    });
};
