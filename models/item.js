const mongoose = require("mongoose");
const { ObjectId } = mongoose.Schema;

const itemSchema = new mongoose.Schema(
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
      required: true,
      index: true,
    },
    postedBy: {
      type: ObjectId,
      ref: "User",
    },
    rating: {
      type: Number,
      default: 0,
    },
    description: {
      type: String,
      max: 150,
    },
    restaurant: {
      type: ObjectId,
      ref: "Restaurant",
    },
    image: {
      url: String,
      key: String,
    },
  },

  { timestamps: true }
);

module.exports = mongoose.model("Item", itemSchema);
