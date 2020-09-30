const express = require("express");
const router = express.Router();

const {
  itemCreateValidator,
  itemUpdateValidator,
} = require("../validators/item");

const { runValidation } = require("../validators");
const {
  requireSignin,
  adminMiddleware,
  authMiddleware,
} = require("../controllers/auth");
const { create, list, read, remove, update } = require("../controllers/item");

router.post(
  "/item",
  itemCreateValidator,
  runValidation,
  requireSignin,
  authMiddleware,
  create
);

router.post("/items", requireSignin, authMiddleware, list);

router.post("/item/:slug", requireSignin, authMiddleware, read);

router.put(
  "/item/:slug",
  itemUpdateValidator,
  runValidation,
  requireSignin,
  update
);

router.delete("/item/:slug", requireSignin, remove);

module.exports = router;
