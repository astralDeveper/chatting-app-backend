const JWT = require("jsonwebtoken");
const configurations = require("../../configurations.js");
const User = require("../models/User.js");

const socketMiddleware = async (socket, next) => {
  const token = socket.handshake.query.token;
  try {
    if (!token) {
      return next(new Error("Authentication error"));
    }
    const { _id } = JWT.verify(token, configurations.jwt_secret);
    if (!_id) {
      return next(new Error("Authentication error"));
    }
    let user = await User.findOne({ _id: _id })
      .select("-password")
      .lean()
      .exec();
    if (!user) {
      return next(new Error("User not found"));
    }
    next();
  } catch (error) {
    return next(new Error("Authentication middleware error"));
  }
};

module.exports = socketMiddleware;
