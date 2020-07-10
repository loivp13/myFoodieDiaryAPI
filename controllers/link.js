const Link = require("../models/link");
const User = require("../models/user");
const Category = require("../models/category");
const slugify = require("slugify");
const AWS = require("aws-sdk");
const { linkPublishedParams } = require("../helpers/email");
const { isArrayLike } = require("lodash");

AWS.config.update({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION,
});
const ses = new AWS.SES({ apiVersion: "2010-12-01" });

exports.create = (req, res) => {
  console.log("create");
  const { title, url, categories, type, medium } = req.body;
  const slug = url;
  let link = new Link({ title, url, categories, type, medium, slug });
  link.postedBy = req.user._id;
  link.save((err, data) => {
    if (err) {
      return res.status(400).json({
        error: "Link already exist",
      });
    }
    res.json({ data });

    User.find({ categories: { $in: categories } }).exec((err, users) => {
      if (err) {
        throw new Error(err);
        console.log("Error finding users to send email onlink publish");
      }
      Category.find({ _id: { $in: categories } }).exec((err, result) => {
        data.categories = result;
        console.log(result);
        for (let i = 0; i < users.length; i++) {
          const params = linkPublishedParams(users[i].email, data);
          const sendEmail = ses.sendEmail(params).promise();
          sendEmail
            .then((success) => {
              console.log("email submitted to SES", success);
              return;
            })
            .catch((fail) => {
              console.log("error sending email by SES", failure);
              return;
            });
        }
      });
    });
  });
};
exports.update = (req, res) => {
  const { id } = req.params;
  const { title, url, categories, type, medium } = req.body;
  const updatedLink = { title, categories, type, medium };
  Link.findOneAndUpdate({ _id: id }, updatedLink, { new: true }).exec(
    (err, updated) => {
      if (err) {
        return res.status(400).json({
          error: "Error updating the link ",
        });
      }
      res.json(updated);
    }
  );
};

exports.read = (req, res) => {
  const { id } = req.params;
  Link.findOne({ _id: id }).exec((err, data) => {
    if (err) {
      return res.status(400).json({
        error: "Error finding link",
      });
    }
    console.log(data);
    res.json(data);
  });
};
exports.remove = (req, res) => {
  const { id } = req.params;
  Link.findOneAndRemove({ _id: id }).exec((err, data) => {
    if (err) {
      return res.status(400).json({
        error: "Errir removing the link",
      });
    }
    res.json({
      message: "Link removed successfully",
    });
  });
};
exports.list = (req, res) => {
  let limit = req.body.limit ? parseInt(req.body.limit) : 10;
  let skip = req.body.skip ? parseInt(req.body.skip) : 0;
  console.log("list");
  Link.find({})
    .populate("categories", "name slug")
    .populate("postedBy", "name")
    .sort({ createdAt: -1 })
    .limit(limit)
    .skip(skip)
    .exec((err, data) => {
      console.log(data);
      if (err) {
        return res.status(400).json({
          error: "Could not list links",
        });
      }
      res.json(data);
    });
};
exports.clickCount = (req, res) => {
  const { linkId } = req.body;
  Link.findByIdAndUpdate(linkId, { $inc: { clicks: 1 } }, { new: true }).exec(
    (err, result) => {
      if (err) {
        return res.status(400).json({
          error: "Could not update view count",
        });
      }
      res.json(result);
    }
  );
};

exports.popular = (req, res) => {
  Link.find()
    .populate("postedBy", "name")
    .sort({ click: -1 })
    .limit(3)
    .exec((err, links) => {
      if (err) {
        return res.status(400).json({
          error: "Links not found",
        });
      }
      res.json(links);
    });
};
exports.popularInCategory = (req, res) => {
  const { slug } = req.params;
  Category.findOne({ slug }).exec((err, category) => {
    if (err) {
      return res.status(400).json({
        error: "Could not load catgories",
      });
    }

    Link.find({ categories: category })
      .sort({ clicks: -1 })
      .limit(3)
      .exec((err, links) => {
        if (err) {
          return res.status(400).json({
            error: "Links not found",
          });
        }
        res.json(links);
      });
  });
};
