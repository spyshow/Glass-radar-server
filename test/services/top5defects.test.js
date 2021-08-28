const app = require('../../src/app');

describe('\'top5defects\' service', () => {
  it('registered the service', () => {
    const service = app.service('top-5-defects');
    expect(service).toBeTruthy();
  });
});
