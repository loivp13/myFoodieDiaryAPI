const mongoose = require("mongoose");
const { ObjectId } = mongoose.Schema;

const listSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      trim: true,
      require: true,
      max: 50,
    },
    slug: {
      type: String,
      lowercase: true,
      unique: true,
      required: true,
      index: true,
    },
    image: {
      url: String,
      key: String,
    },
    description: {
      type: {},
      max: 55,
    },
    postedBy: {
      type: ObjectId,
      ref: "User",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("List", listSchema);
