module.exports = function () {
  const upload = async (req, res) => {
    console.log(req);
    const { user } = req;
    console.log(user);
    try {
      const file = req.file;

      // make sure file is available
      if (!file) {
        res.status(400).send({
          status: false,
          data: "No file is selected.",
        });
      } else {
        // send response
        console.log(file);
        res.status(200).send({
          status: true,
          message: "File is uploaded.",
          data: {
            name: file.originalname,
            mimetype: file.mimetype,
            filename: file.filename,
            size: file.size,
          },
        });
      }
    } catch (err) {
      res.status(500).send(err);
    }
  };
  return upload;
};
