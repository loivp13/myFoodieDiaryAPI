const { check } = require("express-validator");

exports.shareLinkValidator = [
  check("type").not().isEmpty().withMessage("type is required"),
];
