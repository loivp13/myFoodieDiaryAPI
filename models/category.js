const mongoose = require("mongoose");
const { ObjectId } = mongoose.Schema;

const categorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      trim: true,
      require: true,
      max: 12,
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
    content: {
      type: {},
      min: 20,
      max: 20000,
    },
    postedBy: {
      type: ObjectId,
      ref: "User",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Category", categorySchema);
