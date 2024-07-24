const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    displayName: {
      type: String,
    },
    type: {
      type: String,
      enum: ['user', 'admin', 'super-admin'],
      default: 'user'
    },
    realName: {
      type: String,
    },
    genderInterest: {
      type: String,
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
    blocked: {
      type: Boolean,
      default: false,
    },
    image: {
      path: { type: String },
      filename: { type: String },
      mimetype: { type: String },
      
    },
    address: {
      type: String,
    },
    phone: {
      type: String,
    },
    interests: [String],
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
    isprofileshown: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  },
  {
    timestamps: true,
  }
);

const User = mongoose.model("User", userSchema);
module.exports = User;
