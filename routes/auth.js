const express = require("express");
const router = express.Router();

//import validator
const {
  userRegisterValidator,
  userLoginValidator,
  forgotPasswordValidator,
  resetPasswordValidator,
} = require("../validators/auth");
const { runValidation } = require("../validators");

//import from controllers by desturcting
//  CONTROLLERS IMPORT
const {
  register,
  registerActivate,
  login,
  requireSignin,
  forgotPassword,
  resetPassword,
} = require("../controllers/auth");
//                       runs checks,           check for errors if any
router.post("/register", userRegisterValidator, runValidation, register);
router.post("/register/activate", registerActivate);
router.post("/login", userLoginValidator, runValidation, login);
router.put(
  "/forgot-password",
  forgotPasswordValidator,
  runValidation,
  forgotPassword
);
router.put(
  "/reset-password",
  resetPasswordValidator,
  runValidation,
  resetPassword
);

module.exports = router;
