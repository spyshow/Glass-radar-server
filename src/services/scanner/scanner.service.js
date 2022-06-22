// Initializes the `scanner` service on path `/scanner`
const { Scanner } = require("./scanner.class");
const createModel = require("../../models/scanner.model");
const hooks = require("./scanner.hooks");

module.exports = function (app) {
  const options = {
    Model: createModel(app),
    paginate: app.get("paginate"),
  };

  // Initialize our service with any options it requires
  app.use("/scanner", new Scanner(options, app));

  // Get our initialized service so that we can register hooks
  const service = app.service("scanner");

  service.hooks(hooks);
};
