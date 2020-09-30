const express = require("express");
const router = express.Router();

const {
  requireSignin,
  authMiddleware,
  adminMiddleware,
} = require("../controllers/auth");

const { shareLinkValidator } = require("../validators/sharelink");

const {
  create,
  read,
  getShareRestaurantItems,
} = require("../controllers/shareLink");

router.post(
  "/share",
  requireSignin,
  authMiddleware,
  shareLinkValidator,
  create
);

router.get("/share/:listId/:restaurantId", getShareRestaurantItems);

router.get("/share/:id", read);

module.exports = router;
