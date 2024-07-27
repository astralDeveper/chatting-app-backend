const { Router } = require("express");
const { Login, SignUp, CreateProfile, AddInterests, UpdateProfile, GetProfile, GetConversation, GetConversations, blockOrUnblockUser, requestProfileVisibility, sendProfileViewRequest, acceptProfileViewRequest, DeleteRecentChat, GetProfileByID, getProfileByUid, getUserProfiles, requestProfileView, grantProfileView, denyProfileView, otherProfile } = require("../controllers/auth.controller.js");
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
route.post("/get-Profileforrequest", getProfileByUid);
route.get("/get-conversation/:id", verifyToken, GetConversation);
route.delete("/del-conversation/:id1/:id2", verifyToken, DeleteRecentChat);
route.get("/get-conversations", verifyToken, GetConversations);
route.put('/block/:userId', verifyToken, blockOrUnblockUser);


// Route to send profile view request
// route.post('/profile-view-request/:targetUserId', sendProfileViewRequest(io));

route.post("/other-profile", otherProfile);

route.post('/request-profile-view',   requestProfileView);
route.post('/grant-profile-view',   grantProfileView);
route.post('/deny-profile-view',   denyProfileView);
route.post('/request-profile-view', requestProfileView);
route.post('/grant-profile-view', grantProfileView);

// Route to accept profile view request
route.post('/profile-view-request/accept', acceptProfileViewRequest);
module.exports = route;
