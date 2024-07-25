const { Router } = require("express");
const { Login, SignUp, CreateProfile, AddInterests, UpdateProfile, GetProfile, GetConversation, GetConversations, blockOrUnblockUser, requestProfileVisibility, sendProfileViewRequest, acceptProfileViewRequest } = require("../controllers/auth.controller.js");
const { verifyToken } = require("../utlis/auth.js");
const { ProfileImageUploader } = require("../utlis/fileUploder.js");
const io = require('../socket/index.js'); // Import your Socket.IO instance
const route = Router();

route.post("/login", Login);
route.post("/sign-up", SignUp);
route.post("/create-profile", verifyToken, ProfileImageUploader, CreateProfile);
route.put("/add-interests", verifyToken, AddInterests);
route.put("/update-profile", verifyToken, ProfileImageUploader, UpdateProfile);
route.get("/get-profile", verifyToken, GetProfile);
route.get("/get-conversation/:id", verifyToken, GetConversation);
route.get("/get-conversations", verifyToken, GetConversations);
route.put('/block/:userId', verifyToken,blockOrUnblockUser);


// Route to send profile view request
route.post('/profile-view-request/:targetUserId', verifyToken,sendProfileViewRequest(io));

// Route to accept profile view request
route.post('/profile-view-request/accept/:targetUserId',verifyToken, acceptProfileViewRequest(io));
module.exports = route;
