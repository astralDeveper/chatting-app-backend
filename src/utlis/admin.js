const JWT = require("jsonwebtoken");
const User = require("../models/User.js");
const configurations = require("../../configurations.js");

const verifyAdminToken = async (req, res, next) => {
  try {
    let token = req.headers["authorization"];
    if (!token) {
      return res.status(400).json({ message: "Bad request, Authentication key required.", status:false })
    }

    let { _id } = JWT.verify(token, configurations.jwt_secret);

    if (!_id) {
      return res.status(401).json({ message: "Authentiction faild, Invalid Authentication token.", status:false })
    }

    let user = await User.findById(_id).select(['-password']);

    if (user.role === configurations.role.user) {
      return res.status(403).json({ message: "You are not authorized to access this route.",status:false })
    }

    req.user = user;
    next();

  } catch (error) {
    return res.status(500).json({ msg: "Token verification failed." })
  }
}

module.exports = { verifyAdminToken };