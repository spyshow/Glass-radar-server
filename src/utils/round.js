/* eslint-disable linebreak-style */
module.exports.round = function (value, precision) {
  var multiplier = Math.pow(10, precision || 0);
  return Math.round(value * multiplier) / multiplier;
};
