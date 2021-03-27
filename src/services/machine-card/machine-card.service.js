// Initializes the `machine-card` service on path `/machine-card`
const { MachineCard } = require('./machine-card.class');
const hooks = require('./machine-card.hooks');

module.exports = function (app) {
  const options = {
    paginate: app.get('paginate')
  };

  // Initialize our service with any options it requires
  app.use('/machine-card', new MachineCard(options, app));

  // Get our initialized service so that we can register hooks
  const service = app.service('machine-card');

  service.hooks(hooks);
};
