/* eslint-disable linebreak-style */
const users = require("./users/users.service.js");
const machines = require("./machines/machines.service.js");
const machineInit = require("./machine-init/machine-init.service.js");
const scanner = require("./scanner/scanner.service.js");
const jobs = require("./jobs/jobs.service.js");
const machineExist = require("./machine-exist/machine-exist.service.js");
const lines = require("./lines/lines.service.js");
const machineData = require("./machine-data/machine-data.service.js");
const molds = require("./molds/molds.service.js");
const machineCard = require("./machine-card/machine-card.service.js");
const lineData = require("./line-data/line-data.service.js");
const linespeed = require("./linespeed/linespeed.service.js");
// eslint-disable-next-line no-unused-vars
module.exports = function (app) {
  app.configure(users);
  app.configure(machines);
  app.configure(machineInit);
  app.configure(scanner);
  app.configure(jobs);
  app.configure(machineExist);
  app.configure(lines);
  app.configure(machineData);
  app.configure(molds);
  app.configure(machineCard);
  app.configure(lineData);
  app.configure(linespeed);
};
