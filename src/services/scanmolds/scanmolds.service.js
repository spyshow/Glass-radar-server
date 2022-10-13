// Initializes the `molds` service on path `/molds`
const { ScanMolds } = require("./scanmolds.class");
const hooks = require("./scanmolds.hooks");

module.exports = function (app) {
  const options = {
    paginate: app.get("paginate"),
  };

  // Initialize our service with any options it requires
  app.use("/scanmolds", new ScanMolds(options, app));

  // Get our initialized service so that we can register hooks
  const service = app.service("scanmolds");

  service.hooks(hooks);
};
