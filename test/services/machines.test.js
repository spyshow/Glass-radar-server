const app = require('../../src/app');

describe('\'machines\' service', () => {
  it('registered the service', () => {
    const service = app.service('machines');
    expect(service).toBeTruthy();
  });
});
