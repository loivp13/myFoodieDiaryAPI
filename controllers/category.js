const Category = require("../models/category");
const Link = require("../models/link");

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

// exports.create = (req, res) => {
//   let form = new formidable.IncomingForm();
//   form.parse(req, (err, fields, files) => {
//     console.log({ err, fields, files });

//     if (err) {
//       return res.status(400).json({
//         error: "Image could not upload",
//       });
//     }
//     const { name, content } = fields;
//     const { image } = files;

//     const slug = slugify(name);
//     let category = new Category({ name, content, slug });
//     if (image.size > 2000000) {
//       return res.status(400).json({
//         error: "Image should be less than 2mb",
//       });
//     }
//     //upload iamge to s3
//     const params = {
//       Bucket: "node-lvp",
//       Key: `category/${uuidv4()}`,
//       Body: fs.readFileSync(image.path),
//       //ACL---Access control read
//       ACL: "public-read",
//       ContentType: "image/jpg",
//     };
//     s3.upload(params, (err, data) => {
//       console.table(data);
//       console.log(err);
//       if (err) res.status(400).json({ error: "Upload to s3 failed" });
//       category.image.url = data.Location;
//       category.image.key = data.Key;

//       //save to db
//       category.save((err, success) => {
//         if (err) res.status(400).json({ error: "error saving category to db" });
//         return res.json(success);
//       });
//     });
//   });
// };

exports.create = (req, res) => {
  const { name, image, content } = req.body;

  //image data
  const base64 = new Buffer.from(
    image.replace(/^data:image\/\w+;base64/, ""),
    "base64"
  );
  const type = image.split(";")[0].split("/")[1];
  const slug = slugify(name);
  let category = new Category({ name, content, slug });

  const params = {
    Bucket: "node-lvp",
    Key: `category/${uuidv4()}.${type}`,
    Body: base64,
    //ACL---Access control read
    ACL: "public-read",
    ContentEncoding: "base64",
    ContentType: "image/jpg",
  };
  s3.upload(params, (err, data) => {
    if (err) res.status(400).json({ error: "Upload to s3 failed" });
    category.image.url = data.Location;
    category.image.key = data.Key;
    category.postedBy = req.user._id;

    //save to db
    category.save((err, success) => {
      if (err) {
        console.log(err);
        res.status(400).json({ error: "error saving category to db" });
      }
      return res.json(success);
    });
  });
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
  const { name, image, content } = req.body;

  const base64 = new Buffer.from(
    image.replace(/^data:image\/\w+;base64/, ""),
    "base64"
  );
  const type = image.split(";")[0].split("/")[1];
  Category.findOneAndUpdate({ slug }, { name, content }, { new: true }).exec(
    (err, updated) => {
      if (err) {
        return res.status(400).json({
          error: "Could not find category to update",
        });
      }
      console.log("updated", updated);
      if (image) {
        //remove the existng image from s3 before uploading new/updated one
        const deleteParams = {
          Bucket: "node-lvp",
          Key: `${updated.image.key}`,
        };
        s3.deleteBucket(deleteParams, (err, data) => {
          if (err) console.log("s3 delete error during update");
          else console.log("s3 deleted", data);
        });
        //handle upload image
        const params = {
          Bucket: "node-lvp",
          Key: `category/${uuidv4()}.${type}`,
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
              res.status(400).json({ error: "error saving category to db" });
            }
            return res.json(success);
          });
        });
      } else {
        res.json(updated);
      }
    }
  );
};

exports.read = (req, res) => {
  const { slug } = req.params;
  let limit = req.body.limit ? parseInt(req.body.limit) : 10;
  let skip = req.body.skip ? parseInt(req.body.skip) : 0;

  Category.findOne({ slug })
    .populate("postedBy", "_id name username")
    .exec((err, category) => {
      if (err) {
        return res.status(400).json({
          error: "Could not load category",
        });
      }
      Link.find({ categories: category })
        .populate("postedBy", "_id name username")
        .populate("categories", "name")
        .sort({ createdAt: -1 })
        .limit(limit)
        .skip(skip)
        .exec((err, links) => {
          console.log(links);
          if (err) {
            return res.status(400).json({
              error: "Could not load links of a category",
            });
          }
          res.json({ category, links });
        });
    });
};

exports.remove = (req, res) => {
  const { slug } = req.params;
  console.log(slug);
  Category.findOneAndRemove({ slug }).exec((err, data) => {
    const deleteParams = {
      Bucket: "node-lvp",
      Key: `${data.image.key}`,
    };
    if (err) {
      return res.status(400).json({
        error: "Could not delete category",
      });
    }
    s3.deleteObject(deleteParams, (err, data) => {
      if (err) console.log("s3 delete error during removal", err);
      else console.log("s3 remove successful", data);
    });
    res.json({
      message: "Category deleted successfully",
    });
  });
};

exports.list = (req, res) => {
  Category.find({}).exec((err, data) => {
    if (err) {
      return res.status(400).json({
        error: "Categories could not load",
      });
    }
    res.json(data);
  });
};
