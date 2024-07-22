const cloudinary = require("cloudinary").v2;
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const multer = require("multer");
require("dotenv").config();


cloudinary.config({
  cloud_name: process.env.CLOUDNAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});


const AssetStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "bubber/profile",
    resource_type: "auto",
    allowed_formats: [
      "jpg",
      "jpeg",
      "png",
      "webp",
    ],
  },
});

const ProfileImageUploader = multer({ storage: AssetStorage }).single("image");
const Test = multer({ storage: multer.memoryStorage() }).single("image");

module.exports = {ProfileImageUploader, cloudinary,Test};