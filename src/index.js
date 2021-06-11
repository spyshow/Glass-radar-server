/* eslint-disable no-console */
const logger = require("./logger");
const app = require("./app");
const port = app.get("port");
const server = app.listen(port);
const CronJobManager = require("cron-job-manager");
const manager = new CronJobManager();

process.on("unhandledRejection", (reason, p) =>
  logger.error("Unhandled Rejection at: Promise ", p, reason)
);
process.on("unhandledRejection", (up) => {
  console.log(up);
});

server.on("listening", () => {
  //start gathering lines speed to linespeed table
  if (!manager.exists("linespeed")) {
    manager.add(
      //we add a corn job
      "linespeed",
      "* * * * *",
      () => {
        app.service("linespeed").find();
      },
      {
        start: true,
      }
    );
  }

  logger.info(
    "Feathers application started on http://%s:%d",
    app.get("host"),
    port
  );
});
