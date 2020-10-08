const User = require("../models/user");
const Link = require("../models/link");
const List = require("../models/list");
const Restaurant = require("../models/restaurant");
const Item = require("../models/item");
const ShareList = require("../models/shareLink");

exports.read = (req, res) => {
  let limit = req.body.limit ? parseInt(req.body.limit) : 100;
  let skip = req.body.skip ? parseInt(req.body.skip) : 0;
  User.findOne({ _id: req.user._id }).exec((err, user) => {
    if (err) {
      return res.status(400).json({
        error: "User not found",
      });
    }
    List.find({ postedBy: user })
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip(0)
      .exec((err, lists) => {
        if (err) {
          return res.status(400).json({
            error: "Could not find lists",
          });
        }
        user.hashed_password = undefined;
        user.salt = undefined;
        res.json({
          user,
          lists,
        });
      });
  });
};

exports.update = (req, res) => {
  const { name, password } = req.body;
  switch (true) {
    case password && password.length < 6:
      return res
        .status(400)
        .json({ error: "Password must be at least 6 characters long" });
      break;
  }
  console.log(name, password);
  // User.findOneAndUpdate(
  //   { _id: req.user._id },
  //   { name, password },
  //   { new: true }
  // ).exec((err, updated) => {
  //   if (err) {
  //     return res.status(400).json({
  //       error: "Could not find user to update",
  //     });
  //   }
  //   updated.hashed_password = undefined;
  //   updated.salt = undefined;
  //   res.json(updated);
  // });
};

exports.getStatistic = async (req, res) => {
  const user = req.user._id;

  const listResponse = await List.find({ postedBy: user });
  const restaurantResponse = await Restaurant.find({ postedBy: user });
  const itemResponse = await Item.find({ postedBy: user });
  const shareListResponse = await ShareList.find({
    postedBy: user,
  });

  console.log(
    listResponse,
    "XXXXXX",
    restaurantResponse,
    "XXXX",
    itemResponse,
    "XXXXX",
    shareListResponse
  );
  res.status(200).json({
    list: listResponse ? listResponse : null,
    restaurant: restaurantResponse ? restaurantResponse : null,
    item: itemResponse ? itemResponse : null,
    shareList: shareListResponse ? shareListResponse : null,
  });
};
