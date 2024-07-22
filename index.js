const http = require("http");
const configurations = require("./configurations.js");
const app = require("./src/app.js");
const dbConnection = require("./src/utlis/dbConnection.js");
const socketServer = require("./src/socket/index.js");
const server = http.createServer(app);
const io = require("socket.io")(server);

const onListening = async () => {
  try {
    console.log("server is up...");
    await dbConnection();
    socketServer(io);
  } catch (error) {
    console.log(error);
    process.exit(1);
  }
};

server.listen(configurations.port);
server.on("listening", onListening);
