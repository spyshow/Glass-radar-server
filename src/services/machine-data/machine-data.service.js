// Initializes the `machine-data` service on path `/machine-data`
const { MachineData } = require("./machine-data.class");
const hooks = require("./machine-data.hooks");

module.exports = function (app) {
  const options = {
    paginate: app.get("paginate"),
  };

  // Initialize our service with any options it requires
  app.use("/machine-data", new MachineData(options, app));

  // Get our initialized service so that we can register hooks
  const service = app.service("machine-data");

  service.hooks(hooks);
};
