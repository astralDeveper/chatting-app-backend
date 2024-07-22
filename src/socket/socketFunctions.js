const Conversation = require("../models/Conversation.js");
const Online = require("../models/Online.js");

const setUserOnline = async (data) => {
  // console.log("DDSS",data)
  try {
    let userExists = await Online.findOne({ user: data?.userId });

    if (userExists) {
      userExists.socketId = data?.socketId;
      userExists.isOnline = true;
      await userExists.save();
      return;
    }

    await Online.create({
      user: data?.userId,
      socketId: data?.socketId,
      isOnline: true,
    });
  } catch (error) {
    throw new Error("Error setting user online: " + error?.message);
  }
};

const setUserOffline = async (data) => {
  try {
    await Online.findOneAndDelete({ socketId: data?.socketId });
  } catch (error) {
    throw new Error("Error setting user offline: " + error.message);
  }
};

const insertChat = async (data) => {
  try {
    let chat = await Conversation.findOne({
      participants: { $all: [data?.from, data?.to] },
    });

    let latestMessage;

    if (chat) {
      chat.messages.push({
        sender: data?.from,
        content: data?.message,
      });
      await chat.save();
      latestMessage = chat.messages[chat.messages.length - 1];
    } else {
      chat = await Conversation.create({
        participants: [data?.from, data?.to],
        messages: [
          {
            sender: data?.from,
            content: data?.message,
          },
        ],
      });
      latestMessage = chat.messages[0];
    }

    return latestMessage
  } catch (error) {
    throw new Error("Error inserting chat: " + error.message);
  }
};

const getOnlineReceipt = async (data) => {
  try {
    let user = await Online.findOne({ user: data?.userId });
    if (user) {
      return user;
    }
    return null;
  } catch (error) {
    throw new Error("Error getting online receipt: " + error.message);
  }
};

module.exports = {
  setUserOnline,
  setUserOffline,
  insertChat,
  getOnlineReceipt,
};
