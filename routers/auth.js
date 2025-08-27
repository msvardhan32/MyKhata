//External Modules
const express = require("express");

//Local Modlues
const authController = require("../controllers/authContoller");

const router = express.Router();

router.get("/login", authController.getLogin);
router.post("/login", authController.postLogin);
router.post("/logout", authController.postlogOut);
router.get("/signup", authController.getSignUP);
router.post("/signUp", authController.postSignUp);

module.exports = router;
