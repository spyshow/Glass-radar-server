// Initializes the `init` service on path `/init`
const { Init } = require('./init.class');
const hooks = require('./init.hooks');

module.exports = function (app) {
  const options = {
    paginate: app.get('paginate')
  };

  // Initialize our service with any options it requires
  app.use('/init', new Init(options, app));

  // Get our initialized service so that we can register hooks
  const service = app.service('init');

  service.hooks(hooks);
};
