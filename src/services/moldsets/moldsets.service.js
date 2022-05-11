// Initializes the `moldsets` service on path `/moldsets`
const { Moldsets } = require("./moldsets.class");
const createModel = require("../../models/moldsets.model");
const hooks = require("./moldsets.hooks");

module.exports = function (app) {
  const options = {
    Model: createModel(app),
    paginate: app.get("paginate"),
    multi: ["create", "update", "patch", "remove"],
  };

  // Initialize our service with any options it requires
  app.use("/moldsets", new Moldsets(options, app));

  // Get our initialized service so that we can register hooks
  const service = app.service("moldsets");

  service.hooks(hooks);
};
