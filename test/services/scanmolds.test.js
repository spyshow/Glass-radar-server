const app = require("../../src/app");

describe("'scanmolds' service", () => {
  it("registered the service", () => {
    const service = app.service("scanmolds");
    expect(service).toBeTruthy();
  });
});
