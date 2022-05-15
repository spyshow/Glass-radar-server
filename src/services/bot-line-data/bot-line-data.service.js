// Initializes the `bot-line-data` service on path `/bot-line-data`
const { BotLineData } = require('./bot-line-data.class');
const createModel = require('../../models/bot-line-data.model');
const hooks = require('./bot-line-data.hooks');

module.exports = function (app) {
  const options = {
    Model: createModel(app),
    paginate: app.get('paginate')
  };

  // Initialize our service with any options it requires
  app.use('/bot-line-data', new BotLineData(options, app));

  // Get our initialized service so that we can register hooks
  const service = app.service('bot-line-data');

  service.hooks(hooks);
};
