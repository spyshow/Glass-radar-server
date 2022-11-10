/* eslint-disable linebreak-style */
/* eslint-disable indent */
const dayjs = require("dayjs");

module.exports.timeRange = function (startDate, endDate) {
  let fromDate = dayjs(startDate);
  let toDate = dayjs(endDate);
  let diff = toDate.diff(fromDate, "minutes");
  let timeInterval = diff / 12;
  console.log("diff: ", diff);
  console.log("timeInterval: ", timeInterval);

  return timeInterval;
};
