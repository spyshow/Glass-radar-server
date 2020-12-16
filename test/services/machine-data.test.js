const app = require('../../src/app');

describe('\'machine-data\' service', () => {
  it('registered the service', () => {
    const service = app.service('machine-data');
    expect(service).toBeTruthy();
  });
});
