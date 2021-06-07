// Initializes the `linespeed` service on path `/linespeed`
const { Linespeed } = require("./linespeed.class");
const createModel = require("../../models/linespeed.model");
const hooks = require("./linespeed.hooks");

module.exports = function (app) {
  const options = {
    Model: createModel(app),
    paginate: app.get("paginate"),
    multi: ["remove"], // list of method names
  };

  // Initialize our service with any options it requires
  app.use("/linespeed", new Linespeed(options, app));

  // Get our initialized service so that we can register hooks
  const service = app.service("linespeed");

  service.hooks(hooks);
};
