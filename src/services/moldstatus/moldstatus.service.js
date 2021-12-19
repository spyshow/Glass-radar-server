// Initializes the `moldstatus` service on path `/moldstatus`
const { Moldstatus } = require('./moldstatus.class');
const createModel = require('../../models/moldstatus.model');
const hooks = require('./moldstatus.hooks');

module.exports = function (app) {
  const options = {
    Model: createModel(app),
    paginate: app.get('paginate')
  };

  // Initialize our service with any options it requires
  app.use('/moldstatus', new Moldstatus(options, app));

  // Get our initialized service so that we can register hooks
  const service = app.service('moldstatus');

  service.hooks(hooks);
};
