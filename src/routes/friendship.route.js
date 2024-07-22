const { Router } = require("express");
const { verifyToken } = require("../utlis/auth.js");
const { getSuggestions } = require("../controllers/friendship.controller.js");
const route = Router();


route.get("/get-suggestions", verifyToken, getSuggestions); 

module.exports = route;