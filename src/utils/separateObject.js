/* eslint-disable linebreak-style */
module.exports.separateObject = function (obj) {
  const res = [];
  const keys = Object.keys(obj);
  keys.forEach((key, i) => {
    res.push({
      [key]: obj[key],
      id: i,
    });
  });
  return res;
};
