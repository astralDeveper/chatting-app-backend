const { Router } = require("express");
const { Login, SignUp, CreateProfile, AddInterests, UpdateProfile, GetProfile, GetConversation } = require("../controllers/auth.controller.js");
const { verifyToken } = require("../utlis/auth.js");
const { ProfileImageUploader } = require("../utlis/fileUploder.js");

const route = Router();

route.post("/login", Login);
route.post("/sign-up", SignUp);
route.post("/create-profile", verifyToken, ProfileImageUploader, CreateProfile);
route.put("/add-interests", verifyToken, AddInterests);
route.put("/update-profile", verifyToken, ProfileImageUploader, UpdateProfile);
route.get("/get-profile", verifyToken, GetProfile);
route.get("/get-conversation/:id", verifyToken, GetConversation);
module.exports = route;
