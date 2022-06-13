const chroma = require("chroma-js");

module.exports.autoColorPicker = function (color) {
  let returnedColor;

  chroma(color).luminance() > 0.5
    ? (returnedColor = chroma(color).darken(2).hex())
    : (returnedColor = chroma(color).brighten(2).hex());
  return returnedColor;
};
module.exports.colorArray = function (primary, secondary) {
  let array = chroma.scale([primary, secondary]).colors(4);
  return array.map((color) => {
    let dark = chroma(color).darken(4);
    let light = chroma(color).brighten(2.4);
    return chroma.scale([dark, color, light]).colors(15);
  });
};

module.exports.basicColorArray = function(primary,secondary){
  return chroma.scale([primary, secondary]).colors(4);
}
