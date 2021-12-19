const app = require('../../src/app');

describe('\'moldstatus\' service', () => {
  it('registered the service', () => {
    const service = app.service('moldstatus');
    expect(service).toBeTruthy();
  });
});
