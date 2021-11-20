/* eslint-disable linebreak-style */
const users = require("./users/users.service.js");
const machines = require("./machines/machines.service.js");
const machineInit = require("./machine-init/machine-init.service.js");
const scanner = require("./scanner/scanner.service.js");
const jobs = require("./jobs/jobs.service.js");
const machineExist = require("./machine-exist/machine-exist.service.js");
const lines = require("./lines/lines.service.js");
const machineData = require("./machine-data/machine-data.service.js");
const scanMolds = require("./ScanMolds/ScanMolds.service.js");
const machineCard = require("./machine-card/machine-card.service.js");
const lineData = require("./line-data/line-data.service.js");
const linespeed = require("./linespeed/linespeed.service.js");
const top5Defects = require("./top5defects/top5defects.service.js");
const moldsets = require("./moldsets/moldsets.service.js");
const molds = require('./molds/molds.service.js');
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
  app.configure(scanMolds);
  app.configure(machineCard);
  app.configure(lineData);
  app.configure(linespeed);
  app.configure(top5Defects);
  app.configure(moldsets);
  app.configure(molds);
};
