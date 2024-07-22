const User = require("../models/User.js");

const getSuggestions = async (req, res) => {
  try {

    let user = req.user;

    let users = await User.find({ _id: { $ne: user._id } }).select(['name', 'displayName', '_id', 'image', 'realName', 'gender', 'interests']);

    const suggestions = users.map(otherUser => {
      const commonInterests = user.interests.filter(interest => otherUser.interests.includes(interest));
      return {
        user: otherUser,
        matchScore: commonInterests.length,
      };
    });

    return res.status(200).json({suggestions, status:true});

  } catch (error) {
    return res.status(500).json({ msg: error?.message, status: false })
  }
};

module.exports = { getSuggestions };