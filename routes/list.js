const express = require("express");
const router = express.Router();

const {
  listCreateValidator,
  listUpdateValidator,
} = require("../validators/list");

const { runValidation } = require("../validators");
const {
  requireSignin,
  adminMiddleware,
  authMiddleware,
} = require("../controllers/auth");
const { create, list, read, remove, update } = require("../controllers/list");

router.post(
  "/list",
  listCreateValidator,
  runValidation,
  requireSignin,
  authMiddleware,
  create
);

router.post("/lists", requireSignin, list);

router.post("/list/:slug", requireSignin, read);

router.put(
  "/list/:slug",
  listUpdateValidator,
  runValidation,
  requireSignin,
  update
);

router.delete("/list/:slug", requireSignin, remove);

module.exports = router;
