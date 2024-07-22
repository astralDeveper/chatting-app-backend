const socketMiddleware = require("../utlis/socketMiddleware.js");
const {
  setUserOnline,
  setUserOffline,
  getOnlineReceipt,
  insertChat,
} = require("./socketFunctions.js");

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

    socket.on("disconnect", async () => {
      await setUserOffline({ socketId: socket.id });
    });
  });
};

module.exports = socketServer;
