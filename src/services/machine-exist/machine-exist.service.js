// Initializes the `machine-exist` service on path `/machine-exist`
const { MachineExist } = require("./machine-exist.class");
const hooks = require("./machine-exist.hooks");

module.exports = function (app) {
  const options = {

    paginate: app.get("paginate"),
  };

  // Initialize our service with any options it requires
  app.use("/machine-exist", new MachineExist(options, app));

  // Get our initialized service so that we can register hooks
  const service = app.service("machine-exist");

  service.hooks(hooks);
};
