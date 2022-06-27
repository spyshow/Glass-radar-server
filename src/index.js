/* eslint-disable no-console */
const logger = require("./logger");
const app = require("./app");
const port = app.get("port");
const server = app.listen(port);
const init = app.service("init");
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
  //run init service once server start
  let defaultUser = {
    email: "admin@glassradar.com",
    first_name: "admin",
    last_name: "admin",
    password: "password",
    timezone: "Asia/Damascus (2:00)",
    roles: ["Admin", "Moderator", "Mold Admin", "Operator", "User"],
  };
  init.create(defaultUser);

  logger.info(
    "Feathers application started on http://%s:%d , wooohooo!!!",
    app.get("host"),
    port
  );
});
