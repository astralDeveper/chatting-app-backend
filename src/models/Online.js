const mongoose = require("mongoose");

const OnlineUsersSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    socketId: {
      type: String,
    },
    isOnline: {
      type: Boolean,
    },
  },
  {
    timestamps: true,
  }
);

const Online = mongoose.model("Online", OnlineUsersSchema);
module.exports = Online;
