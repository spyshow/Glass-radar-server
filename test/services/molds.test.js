const app = require('../../src/app');

describe('\'molds\' service', () => {
  it('registered the service', () => {
    const service = app.service('molds');
    expect(service).toBeTruthy();
  });
});
