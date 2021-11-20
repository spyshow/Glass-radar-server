// Initializes the `molds` service on path `/molds`
const { Molds } = require('./molds.class');
const createModel = require('../../models/molds.model');
const hooks = require('./molds.hooks');

module.exports = function (app) {
  const options = {
    Model: createModel(app),
    paginate: app.get('paginate')
  };

  // Initialize our service with any options it requires
  app.use('/molds', new Molds(options, app));

  // Get our initialized service so that we can register hooks
  const service = app.service('molds');

  service.hooks(hooks);
};
