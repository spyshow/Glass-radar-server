// Initializes the `line-data` service on path `/line-data`
const { LineData } = require('./line-data.class');
const hooks = require('./line-data.hooks');

module.exports = function (app) {
  const options = {
    paginate: app.get('paginate')
  };

  // Initialize our service with any options it requires
  app.use('/line-data', new LineData(options, app));

  // Get our initialized service so that we can register hooks
  const service = app.service('line-data');

  service.hooks(hooks);
};
