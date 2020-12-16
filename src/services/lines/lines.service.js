// Initializes the `lines` service on path `/lines`
const { Lines } = require("./lines.class");
const createModel = require("../../models/lines.model");
const hooks = require("./lines.hooks");

module.exports = function (app) {
  const options = {
    Model: createModel(app),
    paginate: app.get("paginate"),
  };

  // Initialize our service with any options it requires
  app.use("/lines", new Lines(options, app));

  // Get our initialized service so that we can register hooks
  const service = app.service("lines");

  service.hooks(hooks);
};
