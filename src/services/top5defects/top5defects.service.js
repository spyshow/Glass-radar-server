// Initializes the `top5defects` service on path `/top-5-defects`
const { Top5Defects } = require('./top5defects.class');
const hooks = require('./top5defects.hooks');

module.exports = function (app) {
  const options = {
    paginate: app.get('paginate')
  };

  // Initialize our service with any options it requires
  app.use('/top-5-defects', new Top5Defects(options, app));

  // Get our initialized service so that we can register hooks
  const service = app.service('top-5-defects');

  service.hooks(hooks);
};
