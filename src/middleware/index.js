/* eslint-disable linebreak-style */
const upload = require("./upload");
// eslint-disable-next-line no-unused-vars
//const authenticate = require("@feathersjs/authentication");
const { authenticate } = require("@feathersjs/express"); //
const multer = require("multer");

/********************/
/* TODO: make authintication */
/********************/

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "public/uploads"),
  filename: (req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`),
});
const uploaded = multer({
  storage,
  limits: {
    fieldSize: 1e8, // Max field value size in bytes, here it's 100MB
    fileSize: 1e7, //  The max file size in bytes, here it's 10MB
    // files: the number of files
    // READ MORE https://www.npmjs.com/package/multer#limits
  },
});
// eslint-disable-next-line no-unused-vars
module.exports = function (app) {
  app.post(
    "/upload",
    authenticate("jwt"),
    uploaded.single("files"),
    upload(app)
  );
};
