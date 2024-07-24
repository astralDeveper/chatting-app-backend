const socketMiddleware = require("../utlis/socketMiddleware.js");
const {
  setUserOnline,
  setUserOffline,
  getOnlineReceipt,
  insertChat,
} = require("./socketFunctions.js");
const User = require("../models/User.js"); // Ensure you have this model imported

const socketServer = (io) => {
  io.use(socketMiddleware);

  io.on("connection", (socket) => {
    console.log("new connection");

    socket.on("connected", async (data) => {
      await setUserOnline({ userId: data.id, socketId: socket.id });
    });

    socket.on("test", (data) => {
      console.log(data);
    });

    socket.on("send-message", async (data) => {
      let message = await insertChat(data);

      let receipt = await getOnlineReceipt({ userId: data?.to });

      let sender = await getOnlineReceipt({ userId: data?.from });

      if (receipt) {
        console.log("sending message");
        io.to(receipt.socketId).emit("new-message", message);
      }

      io.to(sender.socketId).emit("message-delivered", message);
    });

    socket.on("send-profile-view-request", async (data) => {
      try {
        const { fromUserId, toUserId } = data;

        // Find the target user
        const targetUser = await User.findById(toUserId);
        if (!targetUser) {
          return socket.emit("error", { message: "Target user not found" });
        }

        // Add the requesting user's ID to the profileViewRequests array if not already present
        if (!targetUser.profileViewRequests.includes(fromUserId)) {
          targetUser.profileViewRequests.push(fromUserId);
          await targetUser.save();

          // Emit an event to notify the target user
          const recipient = await getOnlineReceipt({ userId: toUserId });
          if (recipient) {
            io.to(recipient.socketId).emit("profile-view-request", {
              message: "You have a new profile view request",
              from: fromUserId,
            });
          }
        }
      } catch (error) {
        console.error(error.message);
        socket.emit("error", { message: error.message });
      }
    });

    socket.on("disconnect", async () => {
      await setUserOffline({ socketId: socket.id });
    });
  });
};

module.exports = socketServer;
