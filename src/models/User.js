const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    displayName: {
      type: String,
    },
    realName: {
      type: String,
    },
    genderInterest:{
      type:String,
    },
    gender: {
      type: String,
    },
    language: {
      type: String,
    },
    age: {
      type: String,
    },
    image: {
      path: { type: String },
      filename: { type: String },
      mimetype: { type: String }
    },
    address: {
      type: String
    },
    phone: {
      type: String
    },
    interests: [
      String,
    ],
    name: {
      type: String,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const User = mongoose.model("User", userSchema);
module.exports = User;
