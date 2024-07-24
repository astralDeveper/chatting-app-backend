const User = require("../../models/User.js");
const JWT = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const configurations = require("../../../configurations.js");

const CreateSuperAdmin = async (req, res) => {
  try {

    let hash = await bcrypt.hash('admin123', 12);
    let admin = await User.create({
      email: 'admin@gmail.com',
      password: hash,
      username: "admin",
      name: 'Admin',
      type: configurations.user_type.super_admin,
      role: configurations.role.super_admin
    });

    return res.status(200).json({ message: 'Admin created successfully', status: true, admin });
  } catch (error) {
    return res.status(500).json({ message: error?.message, status: false });
  }
};

const AdminLogin = async (req, res) => {
  try {
    let { email, password } = req.body;
    if (!email?.trim()?.length || !password?.trim()?.length) {
      return res
        .status(400)
        .json({ message: "Bad request! all fields are required." });
    }

    let user = await User.findOne({ email });
    if (!user) {
      return res
        .status(404)
        .json({ message: "User not found with this email! .", status: false });
    }

    if (user.type === configurations.user_type.user) {
      return res
        .status(404)
        .json({ message: `${user?.email} doesn't have permissions to login here.`, status: false });
    }

    let matchPassword = await bcrypt.compare(password, user.password);

    if (!matchPassword) {
      return res
        .status(404)
        .json({ message: "Incorrect email or password! .", status: false });
    }

    let userData = await User.findById(user._id).select(["_id", "email", "name", "username", "image ","type"]);

    let token = JWT.sign({ _id: user._id }, configurations.jwt_secret);

    return res
      .status(200)
      .json({ message: "Login successfull.", user: userData, token });
  } catch (error) {
    return res.status(500).json({ msg: error?.message, status: false });
  }
};

const CreateAdmin = async (req, res) => {
  try {
    let { name, email, password } = req.body;
    if (
      !email?.trim()?.length ||
      !password?.trim()?.length ||
      !name?.trim()?.length
    ) {
      return res
        .status(400)
        .json({ message: "Bad request! all fields are required." });
    }

    let user = await User.findOne({ email });
    if (user) {
      return res
        .status(409)
        .json({ message: "User already exists with this email! ." });
    }

    let hash = await bcrypt.hash(password, 12);

    let newUser = await User.create({
      email,
      password: hash,
      name,
      type: configurations.user_type.admin,
      role: configurations.role.admin
    });

    let token = JWT.sign({ _id: newUser._id }, configurations.jwt_secret);

    return res
      .status(200)
      .json({ message: "Sign Up successfull.", user: newUser, token });
  } catch (error) {
    return res.status(500).json({ msg: error?.message, status: false });
  }
};

const BlockUser = async (req, res) => {
  try {
    let { id } = req.params;
    let user = await User.findOne({ type: configurations.user_type.user, _id: id });

    if (!user.isBlocked) {
      user.isBlocked = true;
      await user.save();
      return res
        .status(200)
        .json({ status: true, message: "User Blocked Successfully.", });
    } else {
      user.isBlocked = false;
      await user.save();
      return res
        .status(200)
        .json({ status: true, message: "User UnBlocked Successfully.", });
    }
  } catch (error) {
    return res.status(500).json({ msg: error?.message, status: false });
  }
};

const GetUsers = async (req, res) => {
  try {
    let users = await User.find({ type: configurations.user_type.user }).select(['_id', 'name', 'username', 'image', 'email', 'blocked', 'plan']);
    return res.status(200).json({ users, status: true });
  } catch (error) {
    return res.status(500).json({ message: error?.message, status: false });
  }
}

const GetUserById = async (req, res) => {
  try {
    let { id } = req.params;
    let user = await User.findOne({ type: configurations.user_type.user, _id: id }).select(['-password']);
    return res
      .status(200)
      .json({ status: true, message: "Successfull.", user });
  } catch (error) {
    return res.status(500).json({ msg: error?.message, status: false });
  }
};



module.exports = {
  CreateSuperAdmin,
  AdminLogin,
  CreateAdmin,
  BlockUser,
  GetUserById,
  GetUsers
}