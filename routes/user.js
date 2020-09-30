const express = require("express");
const router = express.Router();

//import middlwares
const {
  requireSignin,
  authMiddleware,
  adminMiddleware,
} = require("../controllers/auth");
//import validator
const { userUpdateValidator } = require("../validators/auth");
const { runValidation } = require("../validators");

//IMPORT CONTROLLERS
const { read, update, getStatistic } = require("../controllers/user");

//routes
router.get("/user", requireSignin, authMiddleware, read);
router.get("/admin", requireSignin, adminMiddleware, read);
router.get("/statistic", requireSignin, authMiddleware, getStatistic);
router.put(
  "/user",
  userUpdateValidator,
  runValidation,
  requireSignin,
  authMiddleware,
  update
);

module.exports = router;
