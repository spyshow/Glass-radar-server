const app = require('../../src/app');

describe('\'linespeed\' service', () => {
  it('registered the service', () => {
    const service = app.service('linespeed');
    expect(service).toBeTruthy();
  });
});
