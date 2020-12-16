const app = require('../../src/app');

describe('\'machine-exist\' service', () => {
  it('registered the service', () => {
    const service = app.service('machine-exist');
    expect(service).toBeTruthy();
  });
});
