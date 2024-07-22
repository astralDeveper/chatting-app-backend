const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const morgan = require("morgan");

// routes 
const authRoute = require("./routes/auth.route.js");
const friendShipRoute = require("./routes/friendship.route.js");
const { Test } = require("./utlis/fileUploder.js");

const app = express();

app.use(cors());
app.use(bodyParser.urlencoded({extended:false}));
app.use(bodyParser.json());
app.use(morgan("dev"));


app.get("/test",(req,res)=>{
    return res.status(200).json({msg:"test hello!"})
});

app.use("/auth", authRoute);
app.use("/friend-ship", friendShipRoute);

app.post("/test",Test,(req,res)=>{
    console.log(req.file,req.files)
    return res.send({msg:"Hello"})})

module.exports = app;