const xml2js = require("xml2js");

module.exports = async xml => {
  try {
    const parseResult = await xml2js.parseStringPromise(xml);
    return parseResult;
  } catch (e) {
    console.log(e.stack);
    return null;
  }
};
