// Initializes the `jobs` service on path `/jobs`
const { Jobs } = require("./jobs.class");
const createModel = require("../../models/jobs.model");
const hooks = require("./jobs.hooks");

module.exports = function (app) {
  const options = {
    Model: createModel(app),
    paginate: app.get("paginate"),
  };

  // Initialize our service with any options it requires
  app.use("/jobs", new Jobs(options, app));

  // Get our initialized service so that we can register hooks
  const service = app.service("jobs");

  service.hooks(hooks);
};
