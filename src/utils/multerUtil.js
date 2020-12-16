/* eslint-disable linebreak-style */
const multer = require("multer");
const storage = multer.diskStorage({
  //Set the file path after upload, the uploads folder will be created automatically.
  destination: function (req, file, cb) {
    cb(null, "./src/uploads");
  },
  //Rename the uploaded file and get the suffix
  filename: function (req, file, cb) {
    let fileFormat = file.originalname;
    cb(null, fileFormat);
  },
});
// //Add the configuration file to the muler object.
const upload = multer({
  storage: storage,
});

//If you need other settings, please refer to the limits of multer, the usage is as follows.
//var upload = multer({
// storage: storage,
// limits:{}
// });

//Export object
module.exports = upload;
