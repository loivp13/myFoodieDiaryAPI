const ShareLink = require("../models/shareLink");
const Restaurant = require("../models/restaurant");
const List = require("../models/list");
const Item = require("../models/Item");

exports.create = (req, res) => {
  console.log(req);
  const user = req.user._id;
  const { type, shareItemId, name } = req.body;
  console.log(type, shareItemId);
  let shareLink = new ShareLink({
    shareItem: {
      id: shareItemId,
      type,
      postedBy: user,
      name,
    },
    postedBy: user,
  });

  shareLink.save((err, success) => {
    if (err) {
      console.log(err);
      res.status(400).json({
        error: "Error while generating link",
      });
    }
    return res.status(200).json(shareLink);
  });
};

exports.read = (req, res) => {
  const { id } = req.params;
  ShareLink.findOne({ _id: id }).exec((err, sharelink) => {
    if (err) {
      return res.status(400).json({
        error:
          "Error: server../controllers/Sharelink; shareLink.read -> ShareLink.findOne() error  ",
      });
    }

    if (sharelink == null) {
      return res.status(400).json({
        error: "No share link was found, ",
      });
    }

    const { shareItem } = sharelink;
    if (shareItem.type === "restaurant") {
      Restaurant.findOne({ _id: shareItem.id }).exec((err, restaurant) => {
        if (err) {
          res.status(400).json({
            error: "Error: server/controller Restaturant.findOne() error",
          });
        }
        Item.find({ restaurant })
          .sort({ createdAt: 1 })
          .exec((err, items) => {
            if (err) {
              return res.status(400).json({
                error: "Error: looking for Item in /controllers/sharelink",
              });
            }
            return res.status(200).json({
              restaurant,
              items,
            });
          });
      });
    } else {
      List.findOne({ _id: shareItem.id }).exec((err, list) => {
        if (err) {
          res.status(400).json({
            error:
              "Error: server../controllers/Sharelink; shareLink.read -> List.findOne() error",
          });
        }
        Restaurant.find({ list }).exec((err, restaurant) => {
          if (err) {
            res.status(400).json({
              error:
                "Error: server../controllers/Sharelink; shareLink.read -> Restaurant.find() error",
            });
          }
          res.status(200).json({
            list,
            restaurant,
          });
        });
      });
    }
  });
};

exports.getShareRestaurantItems = (req, res) => {
  const { restaurantId } = req.params;
  Item.find({ restaurant: restaurantId }).exec((err, items) => {
    if (err) {
      res.status(400).json({
        error: "Unable to find item",
      });
    }
    Restaurant.findOne({ _id: restaurantId }).exec((err, restaurant) => {
      if (err) {
        res.status(400).json({ error: "Could not find restaurant" });
      }
      res.status(200).json({
        items,
        restaurant,
      });
    });
  });
};
