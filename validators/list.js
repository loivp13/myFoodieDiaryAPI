const { check } = require("express-validator");

exports.listCreateValidator = [
  check("name").not().isEmpty().withMessage("Name is required"),
  check("description")
    .not()
    .isEmpty()
    .withMessage("Description required")
    .isLength({ min: 1, max: 35 })
    .withMessage("max 35 character "),
];

exports.listUpdateValidator = [
  check("name").not().isEmpty().withMessage("Name is required"),
  check("description")
    .isLength({ min: 1, max: 35 })
    .withMessage("Maximum 35 characters"),
];
