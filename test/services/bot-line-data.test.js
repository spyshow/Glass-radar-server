const app = require('../../src/app');

describe('\'bot-line-data\' service', () => {
  it('registered the service', () => {
    const service = app.service('bot-line-data');
    expect(service).toBeTruthy();
  });
});
