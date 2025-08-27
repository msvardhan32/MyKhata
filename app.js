//Core Modules

//External Modules
const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const session = require("express-session");
const mongoDbStore = require("connect-mongodb-session")(session);
const flash = require("connect-flash");
const compression = require("compression");
const helmet = require("helmet");
//Local Modules
const User = require("./models/user");
const userRouter = require("./routers/user");
const authRouter = require("./routers/auth");

const app = express();
app.set("view engine", "ejs");
app.set("views", "views");

const MONGOSTR = `mongodb+srv://harikrishnakgp4:Hari1234@learningcluster.ts8i5.mongodb.net/splitwise`;

const store = new mongoDbStore({
  uri: MONGOSTR,
  collection: "sessions",
});

app.use(express.static("public"));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(compression());
app.use(
  session({
    secret: "MY Secret",
    saveUninitialized: false,
    resave: false,
    store: store,
  })
);

app.use(flash());

app.use((req, res, next) => {
  User.findById(req.session.user)
    .then((user) => {
      req.user = user;
      next();
    })
    .catch((err) => {
      console.log(err);
    });
});

app.use(authRouter);
app.use(userRouter);

const PORT = process.env.PORT || 5000;

mongoose.connect(MONGOSTR).then(() => {
  app.listen(PORT, () => {
    console.log("server Started");
  });
});
