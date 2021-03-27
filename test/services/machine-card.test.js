const app = require('../../src/app');

describe('\'machine-card\' service', () => {
  it('registered the service', () => {
    const service = app.service('machine-card');
    expect(service).toBeTruthy();
  });
});
