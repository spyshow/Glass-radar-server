const app = require('../../src/app');

describe('\'machine-init\' service', () => {
  it('registered the service', () => {
    const service = app.service('machine-init');
    expect(service).toBeTruthy();
  });
});
