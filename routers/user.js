//External Modules
const express = require("express");

//Local Modlues
const userController = require("../controllers/userController");
const auth = require("../middlewares/authenticated");

const router = express.Router();

router.get("/", userController.getIndex);

router.get("/yourExpenses", auth.authenticated, userController.getExpenses);

router.get("/dues", auth.authenticated, userController.getDues);
router.post("/dues/creditAmount", userController.postCreditAmount);
router.post("/dues/approve/:requestId", userController.postApproveRequest);
router.post("/dues/reject/:requestId", userController.postRejectRequest);
router.post("/dues/clear/:requestId", userController.postClearRequest);

router.get("/addexpense", auth.authenticated, userController.getAddExpenses);
router.post("/addExpense", userController.postAddExpense);

router.get("/friendGrp", auth.authenticated, userController.getFriendGrp);
router.post("/addFriend", userController.postAddFriend);
router.post("/addGrp", userController.postAddGrp);

module.exports = router;
