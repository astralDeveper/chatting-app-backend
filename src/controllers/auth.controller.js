const User = require("../models/User.js");
const JWT = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const configurations = require("../../configurations.js");
const { cloudinary } = require("../utlis/fileUploder.js");
const Conversation = require("../models/Conversation.js");

const socketServer = require("../socket/index.js");
const { getOnlineReceipt } = require("../socket/socketFunctions.js");

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
      return res.status(405).json({ message: "Incorrect email or password!." });
    }

    let userData = await User.findById(user._id).select(["-password"]);
    let token = JWT.sign({ _id: user._id }, configurations.jwt_secret, {
      expiresIn: "1h",
    });

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
    const { block } = req.body; // Expecting { "block": true } or { "block": false } in the request body

    if (typeof block !== "boolean") {
      return res
        .status(400)
        .json({ message: "Invalid 'block' value", status: false });
    }

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { blocked: block },
      { new: true }
    ).select("-password");

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found", status: false });
    }

    const message = block
      ? "User blocked successfully."
      : "User unblocked successfully.";
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
const getProfileByUid = async (req, res) => {
  try {
    const uidParam = req.body.id;

    if (!uidParam) {
      return res.status(400).json({ error: "Invalid or missing id in body" });
    }

    const myuser = await User.findById(uidParam)
    const users = await User.find({ '_id': { $in: myuser.profileViewRequests } }).select('displayName _id');

    res.json({ message: "Profiles found", data: users });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: err.message });
  }
};


const GetConversation = async (req, res) => {
  try {
    let auth = req.user;
    let { id } = req.params;

    if (!id) {
      return res
        .status(400)
        .json({ message: "Id is required.", status: false });
    }

    let conversation = await Conversation.findOne({
      participants: { $all: [auth?._id, id] },
    });
    return res.status(200).json({ conversation, status: false });
  } catch (error) {
    return res.status(500).json({ message: error?.message, status: false });
  }
};
const DeleteRecentChat = async (req, res) => {
  try {
    let { id1, id2 } = req.params;

    if (!id1 || !id2) {
      return res
        .status(400)
        .json({ message: "Both participant IDs are required.", status: false });
    }

    // Find and delete the conversation involving both participants
    let result = await Conversation.findOneAndDelete({
      participants: { $all: [id1, id2] },
    });

    if (result) {
      return res
        .status(200)
        .json({ message: "Conversation deleted successfully.", status: true });
    } else {
      return res
        .status(404)
        .json({ message: "Conversation not found.", status: false });
    }
  } catch (error) {
    return res.status(500).json({ message: error?.message, status: false });
  }
};
const GetConversations = async (req, res) => {
  try {
    let auth = req.user;

    let conversations = await Conversation.find({
      participants: { $all: [auth?._id] },
    }).populate({ path: "participants", select: " name _id image" });
    return res.status(200).json({ conversations, status: false });
  } catch (error) {
    return res.status(500).json({ message: error?.message, status: false });
  }
};

const sendProfileViewRequest = (io) => async (req, res) => {
  try {
    console.log("Request Body:", req.body);
    console.log("Request Params:", req.params);

    const { targetUserId } = req.params;
    const requestingUserId = req.body.userid;

    if (!targetUserId || !requestingUserId) {
      return res
        .status(400)
        .json({ message: "Missing required parameters", status: false });
    }

    // Find the target user
    const targetUser = await User.findById(targetUserId);
    if (!targetUser) {
      return res
        .status(404)
        .json({ message: "Target user not found", status: false });
    }

    // Add requestingUserId to profileViewRequests array if not already present
    if (!targetUser.profileViewRequests.includes(requestingUserId)) {
      targetUser.profileViewRequests.push(requestingUserId);
      await targetUser.save();
    }

    // Emit a Socket.IO event to notify the target user
    const recipient = await getOnlineReceipt({ userId: targetUserId });
    if (recipient) {
      io.to(recipient.socketId).emit("profile-view-request", {
        message: "You have a new profile view request",
        from: requestingUserId,
      });
    }

    return res
      .status(200)
      .json({ message: "Profile view request sent", status: true });
  } catch (error) {
    console.error("Error:", error.message);
    return res.status(500).json({ message: error.message, status: false });
  }
};

const requestProfileView = async (req, res) => {
  try {
    const { userId, targetUserId } = req.body;
    const targetUser = await User.findById(targetUserId);
    targetUser.profileViewRequests.push(userId);
    await targetUser.save();
    res.status(200).json({ message: 'Profile view requested' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


const acceptProfileViewRequest = async (req, res) => {
  try {
    const { userid: requesterId, targetUserId } = req.body;
    console.log("first", requesterId, targetUserId)

    if (!targetUserId || !requesterId) {
      return res
        .status(400)
        .json({ message: "Missing required parameters", status: false });
    };

    const myUser = await User.findById(requesterId);
    if (!myUser) {
      return res
        .status(404)
        .json({ message: "Requested user is not found", status: false });
    };

    // Check if the requesterId is in the profileViewRequests array
    if (!myUser.profileViewRequests.includes(targetUserId)) {
      return res
        .status(400)
        .json({ message: "Request not found", status: false });
    };

    // Add requesterId to isprofileshown array
    if (!myUser.isprofileshown.includes(targetUserId)) {
      myUser.isprofileshown.push(targetUserId);
    };

    // Remove requesterId from profileViewRequests array
    myUser.profileViewRequests = myUser.profileViewRequests.filter(
      (id) => id.toString() !== targetUserId
    );

    await myUser.save();

    const targetUser = await User.findById(targetUserId);

    if (!targetUser.isprofileshown.includes(requesterId)) {
      targetUser.isprofileshown.push(requesterId);
    };

    // Remove requesterId from profileViewRequests array
    targetUser.profileViewRequests = targetUser.profileViewRequests.filter(
      (id) => id.toString() !== requesterId
    );

    await targetUser.save();

    return res
      .status(200)
      .json({ message: "Profile view request accepted", user: myUser, status: true });
  } catch (error) {
    return res.status(500).json({ message: error.message, status: false });
  }
};


const grantProfileView = async (req, res) => {
  try {
    const { userId, requesterId } = req.body;

    const user = await User.findById(userId);
    if (user.profileViewRequests.includes(requesterId)) {
      user.isprofileshown.push(requesterId);
      user.profileViewRequests = user.profileViewRequests.filter(id => id.toString() !== requesterId);
      await user.save();
      res.status(200).json({ message: 'Profile view granted' });
    } else {
      res.status(400).json({ message: 'No such request found' });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const otherProfile = async (req, res) => {
  try {
    let { id } = req.body;
    let user = await User.findById(id).select(["-password"]);
    return res.status(200).json({ user, status: false });
  } catch (error) {
    return res.status(500).json({ message: error?.message, status: false });
  }
};


const denyProfileView = async (req, res) => {
  try {
    const { userId, requesterId } = req.body;
    console.log(userId);
    const user = await User.findById(userId);
    console.log(user);
    
    if (user.profileViewRequests.includes(requesterId)) {
      user.profileViewRequests = user.profileViewRequests.filter(id => id.toString() !== requesterId);
      await user.save();
      res.status(200).json({ message: 'Profile view request denied' });
    } else {
      res.status(400).json({ message: 'No such request found' });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
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
  blockOrUnblockUser,
  sendProfileViewRequest,
  acceptProfileViewRequest,
  DeleteRecentChat,
  getProfileByUid,
  requestProfileView,
  grantProfileView,
  otherProfile,
  grantProfileView,
  denyProfileView
};
