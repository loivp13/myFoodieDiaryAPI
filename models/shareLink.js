const mongoose = require("mongoose");
const { ObjectId } = mongoose.Schema;

const shareLinkSchema = new mongoose.Schema({
  shareItem: {
    name: String,
    id: String,
    type: {
      String,
      require: true,
    },
    postedBy: {
      type: ObjectId,
      ref: "User",
    },
  },
  postedBy: {
    type: ObjectId,
    ref: "User",
  },
  createdAt: { type: Date, expires: 288000, default: Date.now() },
});

module.exports = mongoose.model("ShareLink", shareLinkSchema);
