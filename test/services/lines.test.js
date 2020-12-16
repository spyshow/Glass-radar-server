const app = require('../../src/app');

describe('\'lines\' service', () => {
  it('registered the service', () => {
    const service = app.service('lines');
    expect(service).toBeTruthy();
  });
});
