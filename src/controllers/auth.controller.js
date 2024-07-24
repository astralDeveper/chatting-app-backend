const User = require("../models/User.js");
const JWT = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const configurations = require("../../configurations.js");
const { cloudinary } = require("../utlis/fileUploder.js");
const Conversation = require("../models/Conversation.js");

const Login = async (req, res) => {
  try {
    let { email, password } = req.body;
    if (!email?.trim()?.length || !password?.trim()?.length) {
      return res
        .status(400)
        .json({ message: "Bad request! All fields are required." });
    }

    let user = await User.findOne({ email });
    if (!user) {
      return res
        .status(404)
        .json({ message: "User not found with this email!." });
    }

    if (user.blocked) {
      return res
        .status(403)
        .json({ message: "Your account is blocked. Please contact support." });
    }

    let matchPassword = await bcrypt.compare(password, user.password);
    if (!matchPassword) {
      return res
        .status(405)
        .json({ message: "Incorrect email or password!." });
    }

    let userData = await User.findById(user._id).select(["-password"]);
    let token = JWT.sign({ _id: user._id }, configurations.jwt_secret, { expiresIn: '1h' });

    return res
      .status(200)
      .json({ message: "Login successful.", user: userData, token });
  } catch (error) {
    return res.status(500).json({ message: error?.message, status: false });
  }
};
const SignUp = async (req, res) => {
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
        .status(404)
        .json({ message: "User already exists with this email! ." });
    }

    let hash = await bcrypt.hash(password, 12);

    let newUser = await User.create({
      email,
      password: hash,
      name,
    });

    let token = JWT.sign({ _id: newUser._id }, configurations.jwt_secret);

    return res
      .status(200)
      .json({ message: "Sign Up successfull.", user: newUser, token });
  } catch (error) {
    return res.status(500).json({ msg: error?.message, status: false });
  }
};

const CreateProfile = async (req, res) => {
  try {
    let { displayName, realName, language, gender, age } = req.body;
    if (
      !displayName?.trim()?.length ||
      !realName?.trim()?.length ||
      !language?.trim()?.length ||
      !gender?.trim()?.length ||
      !age?.trim()?.length
    ) {
      return res
        .status(400)
        .json({ message: "Bad request! all fields are required." });
    }

    let user = await User.findByIdAndUpdate(
      req.user._id,
      { ...req.body, image: { ...req.file } },
      { new: true }
    ).select(["-password"]);

    return res.status(200).json({ message: "Profile Created Successfully" });
  } catch (error) {
    return res.status(500).json({ message: error?.message, status: false });
  }
};

const AddInterests = async (req, res) => {
  try {
    let { interests, genderInterest } = req.body;
    let auth = req.user;
    await User.findByIdAndUpdate(
      auth._id,
      { interests, genderInterest },
      { new: true }
    );

    return res.status(200).json({ message: "Interest Added Successfully" });
  } catch (error) {
    return res.status(500).json({ message: error?.message, status: false });
  }
};

const UpdateProfile = async (req, res) => {
  try {
    let file = req?.file;
    let user = req.user;
    let data = req.body;

    if (file) {
      await cloudinary.api.delete_resources([user.image.filename], {
        resource_type: user?.image?.mimetype?.split("/")[0] ?? "image",
        type: "upload",
      });
      await User.findByIdAndUpdate(user._id, { image: file });
    }

    let updatedUser = await User.findByIdAndUpdate(user._id, data, {
      new: true,
    }).select(["-password"]);

    return res.status(200).json({
      user: updatedUser,
      message: "Profile updated successfuly.",
      status: true,
    });
  } catch (error) {
    return res.status(500).json({ message: error?.message, status: false });
  }
};


const blockOrUnblockUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const { block } = req.body;  // Expecting { "block": true } or { "block": false } in the request body

    if (typeof block !== 'boolean') {
      return res.status(400).json({ message: "Invalid 'block' value", status: false });
    }

    const updatedUser = await User.findByIdAndUpdate(userId, { blocked: block }, { new: true }).select('-password');

    if (!updatedUser) {
      return res.status(404).json({ message: 'User not found', status: false });
    }

    const message = block ? 'User blocked successfully.' : 'User unblocked successfully.';
    return res.status(200).json({ user: updatedUser, message, status: true });
  } catch (error) {
    return res.status(500).json({ message: error.message, status: false });
  }
};

const GetProfile = async (req, res) => {
  try {
    let auth = req.user;
    let user = await User.findById(auth._id).select(["-password"]);
    return res.status(200).json({ user, status: false });
  } catch (error) {
    return res.status(500).json({ message: error?.message, status: false });
  }
};

const GetConversation = async (req, res) => {
  try {
    let auth = req.user;
    let { id } = req.params;

    if(!id){
      return res.status(400).json({message:"Id is required.", status:false});
    }

    let conversation = await Conversation.findOne({
      participants: { $all: [auth?._id, id] },
    });
    return res.status(200).json({ conversation, status: false });
  } catch (error) {
    return res.status(500).json({ message: error?.message, status: false });
  }
};
const GetConversations = async (req, res) => {
  try {
    let auth = req.user;
   

    let conversations = await Conversation.find({
      participants: { $all: [auth?._id] },
    }).populate({path:"participants",
      select:" name _id image"
    })
    return res.status(200).json({ conversations, status: false });
  } catch (error) {
    return res.status(500).json({ message: error?.message, status: false });
  }
};

module.exports = {
  Login,
  SignUp,
  CreateProfile,
  AddInterests,
  UpdateProfile,
  GetProfile,
  GetConversation,
  GetConversations,
  blockOrUnblockUser
};
