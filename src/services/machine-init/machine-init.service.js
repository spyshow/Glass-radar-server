// Initializes the `machine-init` service on path `/machine-init`
const { MachineInit } = require("./machine-init.class");
const hooks = require("./machine-init.hooks");

module.exports = function (app) {
  const options = {
    paginate: app.get("paginate"),
  };

  // Initialize our service with any options it requires
  app.use("/machine-init", new MachineInit(options, app));

  // Get our initialized service so that we can register hooks
  const service = app.service("machine-init");

  service.hooks(hooks);
};
