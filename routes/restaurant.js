const express = require("express");
const router = express.Router();

const {
  restaurantCreateValidator,
  restaurantUpdateValidator,
} = require("../validators/restaurant");

const { runValidation } = require("../validators");
const {
  requireSignin,
  adminMiddleware,
  authMiddleware,
} = require("../controllers/auth");
const {
  create,
  list,
  read,
  remove,
  update,
} = require("../controllers/restaurant");

router.post(
  "/restaurant",
  restaurantCreateValidator,
  runValidation,
  requireSignin,
  authMiddleware,
  create
);

router.post("/restaurants", requireSignin, authMiddleware, list);

router.post("/restaurant/:slug", requireSignin, authMiddleware, read);

router.put(
  "/restaurant/:slug",
  restaurantUpdateValidator,
  runValidation,
  requireSignin,
  update
);

router.delete("/restaurant/:slug", requireSignin, authMiddleware, remove);

module.exports = router;
