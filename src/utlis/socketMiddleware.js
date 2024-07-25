const JWT = require("jsonwebtoken");
const configurations = require("../../configurations.js");
const User = require("../models/User.js");

const socketMiddleware = async (socket, next) => {
  const token = socket.handshake.query.token;
  try {
    if (!token) {
      return next(new Error("Token is required"));
    }
    const decoded = JWT.verify(token, configurations.jwt_secret);
    const user = await User.findById(decoded._id).select("-password").lean().exec();
    if (!user) {
      return next(new Error("User not found"));
    }
    socket.user = user; // Optionally attach the user to the socket object
    next();
  } catch (error) {
    next(new Error("Invalid token or authentication error"));
  }
};


module.exports = socketMiddleware;
