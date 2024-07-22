const mongoose = require("mongoose");
const configurations = require("../../configurations");

const dbConnection = async () => {
  try {
    await mongoose.connect(configurations.db_string);
  } catch (error) {
    console.error("MongoDB connection error:", error.message);
    process.exit(1);
  }
};

mongoose.connection.on("connected", () => {
  console.log("MongoDB connected successfully");
});

mongoose.connection.on("error", (err) => {
  console.error("MongoDB connection error:", err);
});

mongoose.connection.on("disconnected", () => {
  console.log("MongoDB disconnected");
});

module.exports = dbConnection;
