const mongoose = require("mongoose");
const { ObjectId } = mongoose.Schema;

const restaurantSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      trim: true,
      require: true,
      max: 100,
    },
    description: {
      type: String,
      max: 135,
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
    list: [
      {
        type: ObjectId,
        ref: "List",
        require: true,
      },
    ],
    rating: {
      type: Number,
      default: 0,
    },
    image: {
      url: String,
      key: String,
    },
  },

  { timestamps: true }
);

module.exports = mongoose.model("Restaurant", restaurantSchema);
