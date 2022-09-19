export {};
const dotenv = require('dotenv');
const path = require('path');
const mongoose = require("mongoose");
const cors = require("cors");
const cloudinary = require("cloudinary").v2;

// eslint-disable-next-line import/no-unresolved, import/extensions
const app = require("./app");
const config = require("../config");

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.API_KEY,
  api_secret: process.env.API_SECRET,
});

mongoose.connect(process.env.MONGODB_URL);

app.use(cors());

if (process.env.NODE_ENV !== "prod") {
  dotenv.config({
    path: path.resolve(__dirname, `${process.env.NODE_ENV}.env`),
  });

  app.listen(config.PORT, config.HOST, () => {
    console.log(`APP LISTENING ON http://${config.HOST}:${config.PORT}`);
  });
} else {
  app.listen(config.PORT, () => {
    console.log(`APP LISTENING ON http://${config.PORT}`);
  });
}