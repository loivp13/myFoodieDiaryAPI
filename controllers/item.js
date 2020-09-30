const Restaurant = require("../models/restaurant");
const List = require("../models/list");
const Item = require("../models/Item");

const slugify = require("slugify");
const formidable = require("formidable");
const { v4: uuidv4 } = require("uuid");
const AWS = require("aws-sdk");

//AWS
const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION,
});

exports.create = (req, res) => {
  const { name, image, description, list, listId, rating } = req.body;
  //image data

  const base64 = new Buffer.from(
    image.replace(/^data:image\/\w+;base64/, ""),
    "base64"
  );
  const type = image.split(";")[0].split("/")[1];
  const slug = slugify(name);
  let item = new Item({
    name,
    description,
    slug,
    list,
    rating,
    restaurant: list,
  });

  const params = {
    Bucket: "foodiediary",
    Key: `list/${uuidv4()}.${type}`,
    Body: base64,
    //ACL---Access control read
    ACL: "public-read",
    ContentEncoding: "base64",
    ContentType: "image/jpg",
  };
  if (image) {
    s3.upload(params, (err, data) => {
      console.log(`--S3 upload failed-- ${err}`);
      if (err) res.status(400).json({ error: "Upload to s3 failed" });
      item.image.url = data.Location;
      item.image.key = data.Key;
      item.postedBy = req.user._id;

      //save to db > {
      if (err) {
        console.log(err);
        res
          .status(400)
          .json({ error: "Error saving, please use a different name" });
      }

      item.save((err, success) => {
        if (err) {
          console.log(error);
        }
        return res.status(200).json(item);
      });
    });
  } else {
    item.image.url =
      "https://foodiediary.s3.us-west-2.amazonaws.com/list/f593bd43-2a3b-4b2e-9b65-0cf1d0733f23.jpeg";
    item.image.key = "";
    item.postedBy = req.user._id;
    //save to db
    item.save((err, success) => {
      if (err) {
        console.log(err);
        res.status(400).json({ error: "error saving item to db" });
      }
      return res.json(item);
    });
  }
};
// exports.create = (req, res) => {
//   const { name, content } = req.body;
//   const slug = slugify(name);
//   console.log(slug);
//   const image = {
//     url: `https://via.placeholder.com/200x150.png?text=${process.env.CLIENT_URL}`,
//     key: "123",
//   };

//   const category = new Category({ name, slug, image });
//   category.postedBy = req.user._id;
//   category.save((err, date) => {
//     if (err) {
//       console.log("category error", err);
//       return res.status(400).json({
//         error: "category create failed",
//       });
//     }
//     res.json(data);
//   });
// };

exports.update = (req, res) => {
  const { slug } = req.params;
  const { name, image, description, rating } = req.body;

  const base64 = new Buffer.from(
    image.replace(/^data:image\/\w+;base64/, ""),
    "base64"
  );
  const type = image.split(";")[0].split("/")[1];
  Item.findOneAndUpdate(
    { slug },
    { name, description, rating },
    { new: true }
  ).exec((err, updated) => {
    if (err) {
      return res.status(400).json({
        error: "Could not find list to update",
      });
    }
    console.log("updated", updated);
    if (image) {
      //remove the existng image from s3 before uploading new/updated one
      const deleteParams = {
        Bucket: "foodiediary",
        Key: `${updated.image.key}`,
      };
      s3.deleteBucket(deleteParams, (err, data) => {
        if (err) console.log("s3 delete error during update");
        else console.log("s3 deleted", data);
      });
      //handle upload image
      const params = {
        Bucket: "foodiediary",
        Key: `list/${uuidv4()}.${type}`,
        Body: base64,
        //ACL---Access control read
        ACL: "public-read",
        ContentEncoding: "base64",
        ContentType: "image/jpg",
      };
      s3.upload(params, (err, data) => {
        if (err) res.status(400).json({ error: "Upload to s3 failed" });
        updated.image.url = data.Location;
        updated.image.key = data.Key;

        //save to db
        updated.save((err, success) => {
          if (err) {
            console.log(err);
            res.status(400).json({ error: "error saving list to db" });
          }
          return res.json(success);
        });
      });
    } else {
      res.json(updated);
    }
  });
};

exports.read = (req, res) => {
  let limit = req.body.limit ? parseInt(req.body.limit) : 4;
  let skip = req.body.skip ? parseInt(req.body.skip) : 0;
  let slug = req.params.slug;
  console.log(slug);
  Restaurant.findOne({ slug })
    .sort({ createdAt: 1 })
    .limit(limit)
    .skip(skip)
    .exec((err, restaurant) => {
      console.log(restaurant);
      if (err) {
        return res.status(400).json({
          error: "Lists could not load",
        });
      }
      Item.find({ restaurant })
        .sort({ createdAt: 1 })
        .exec((err, items) => {
          if (err) {
            return res.status(400).json({
              error: "Error looking for Item",
            });
          }
          console.log(restaurant, items);
          return res.status(200).json({ restaurant, items });
        });
    });
};

exports.remove = (req, res) => {
  const { slug } = req.params;
  console.log(slug);
  Item.findOneAndRemove({ slug }).exec((err, data) => {
    const deleteParams = {
      Bucket: "foodiediary",
      Key: `${data.image.key}`,
    };
    if (err) {
      return res.status(400).json({
        error: "Could not delete list",
      });
    }
    s3.deleteObject(deleteParams, (err, data) => {
      if (err) console.log("s3 delete error during removal", err);
      else console.log("s3 remove successful", data);
    });
    res.status(200).json({
      message: "List deleted successfully",
    });
  });
};

exports.list = (req, res) => {
  let limit = req.body.limit ? parseInt(req.body.limit) : 4;
  let skip = req.body.skip ? parseInt(req.body.skip) : 0;
  let slug = req.body.slug;
  Restaurant.find({ slug })
    .sort({ createdAt: 1 })
    .limit(limit)
    .skip(skip)
    .exec((err, restaurant) => {
      console.log(restaurant);
      if (err) {
        return res.status(400).json({
          error: "Lists could not load",
        });
      }
      Item.find({ restaurant })
        .sort({ createdAt: 1 })
        .exec((err, items) => {
          if (err) {
            return res.status(400).json({
              error: "Error looking for Item",
            });
          }
          console.log(restaurant, items);
          return res.json(200).json({ restaurant, items });
        });
    });
};
