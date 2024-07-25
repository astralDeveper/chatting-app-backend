const socketMiddleware = require("../utlis/socketMiddleware.js");
const { setUserOnline, setUserOffline, getOnlineReceipt, insertChat } = require("./socketFunctions.js");
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

        const targetUser = await User.findById(toUserId);
        if (!targetUser) {
          return socket.emit("error", { message: "Target user not found" });
        }

        if (!targetUser.profileViewRequests.includes(fromUserId)) {
          targetUser.profileViewRequests.push(fromUserId);
          await targetUser.save();

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
