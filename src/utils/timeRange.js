/* eslint-disable linebreak-style */
/* eslint-disable indent */
var moment = require("moment");

module.exports.timeRange = function (startDate, endDate) {
  let fromDate = moment(startDate);
  let toDate = moment(endDate);
  let diff = toDate.diff(fromDate, "minutes");
  let timeInterval = diff / 12;
  console.log("diff: ", diff);
  console.log("timeInterval: ", timeInterval);

  return timeInterval;
};
