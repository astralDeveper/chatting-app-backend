require("dotenv").config();
const configurations = {
  server: {
    name: "",
    title: "",
    url: "",
  },
  db_uri: "",
  port: process.env.PORT || 3000,
  jwt_secret: process.env.JWT_SECRET,
  db_string: process.env.MONGODB_URI,
  cloudinary_config:{
    cloud_name: process.env.CLOUDNAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  }
};

module.exports = configurations;
