const app = require('../../src/app');

describe('\'scanner\' service', () => {
  it('registered the service', () => {
    const service = app.service('scanner');
    expect(service).toBeTruthy();
  });
});
