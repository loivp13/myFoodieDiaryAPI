const mongoose = require("mongoose");
const crypto = require("crypto");
const { ObjectId } = mongoose.Schema;

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      //getting rid of spaces before and after.
      trim: true,
      required: true,
      max: 12,
      unique: true,
      index: true,
      lowercase: true,
    },
    name: {
      type: String,
      trim: true,
      required: true,
      max: 32,
    },
    email: {
      type: String,
      trim: true,
      required: true,
      unique: true,
      max: 32,
      lowercase: true,
    },
    hashed_password: {
      type: String,
      required: true,
    },
    salt: String,
    role: {
      type: String,
      default: "subscriber",
    },
    resetPasswordLink: {
      data: String,
      default: "",
    },
    categories: [
      {
        type: ObjectId,
        ref: "Category",
        require: true,
      },
    ],
  },
  { timestamps: true }
);

//virtual fields to do middleware work
userSchema
  .virtual("password")
  //password below is coming from client
  .set(function (password) {
    //create temp variable called _password
    this._password = password;
    //generate salt
    this.salt = this.makeSalt();
    //encrypt  password
    this.hashed_password = this.encryptPassword(password);
  })
  .get(function () {
    return this._password;
  });
//methods > authenciate, encryptPassword,makeSalt
userSchema.methods = {
  authenticate: function (plainText) {
    return this.encryptPassword(plainText) === this.hashed_password;
  },
  encryptPassword: function (password) {
    if (!password) return "";
    try {
      return crypto
        .createHmac("sha1", this.salt)
        .update(password)
        .digest("hex");
    } catch (err) {
      return "";
    }
  },
  makeSalt: function () {
    //can creat salt using other methods as well
    return Math.round(new Date().valueOf() * Math.random());
  },
};
//export user schema
module.exports = mongoose.model("User", userSchema);
