/* eslint-disable no-console */
const logger = require("./logger");
const app = require("./app");
const port = app.get("port");
const server = app.listen(port);
const init = app.service("init");
//const CronJobManager = require("cron-job-manager");
//const manager = new CronJobManager();
const Bree = require("bree");

const pool = require("./db");

process.on("unhandledRejection", (reason, p) =>
  logger.error("Unhandled Rejection at: Promise ", p, reason)
);
process.on("unhandledRejection", (up) => {
  console.log(up);
});

server.on("listening", async () => {
  //start all active scanners
  await pool
    .query({ text: "SELECT * FROM scanner WHERE active=true" })
    .then((res) => {
      res.rows.forEach((scanner) => {
        app.service("scanner").create({ id: scanner.machine_id });
      });
    })
    .catch((err) => console.log(err));
  //start gathering lines speed to linespeed table
  // if (!manager.exists("linespeed")) {
  //   manager.add(
  //     //we add a corn job
  //     "linespeed",
  //     "* * * * *",
  //     () => {
  //       app.service("linespeed").find();
  //     },
  //     {
  //       start: true,
  //     }
  //   );
  // }
  const bree = new Bree({
    jobs: [
      {
        name: "linespeed",
        cron: "* * * * *",
      },
    ],
  });

  (async () => {
    await bree.start("linespeed");
  })();
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
