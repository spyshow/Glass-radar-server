const app = require('../../src/app');

describe('\'line-data\' service', () => {
  it('registered the service', () => {
    const service = app.service('line-data');
    expect(service).toBeTruthy();
  });
});
