const app = require('../../src/app');

describe('\'moldsets\' service', () => {
  it('registered the service', () => {
    const service = app.service('moldsets');
    expect(service).toBeTruthy();
  });
});
