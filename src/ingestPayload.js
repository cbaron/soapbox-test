const xml2js = require("xml2js");

const deriveProcessMessage = payload =>
  payload[`soapenv:Envelope`][`soapenv:Body`][0][`as:ProcessMessage`][0];

const sanitizeValue = value => {
  // hacky
  if (Array.isArray(value) && value.length === 1) {
    return sanitizeValue(value[0]);
  } else if (typeof value === "object") {
    if (value.$) {
      return sanitizeValue(value.$);
    }
    return sanitizeGenericCDataObject(value);
  } else if (
    typeof value === "string" &&
    (value === "true" || value === "false")
  ) {
    return value === "true";
  }
  return value;
};

const sanitizeGenericCDataObject = data => {
  return Object.entries(data).reduce((memo, [key, value]) => {
    return {
      ...memo,
      [key]: sanitizeValue(value)
    };
  }, {});
};
module.exports = async xml => {
  try {
    const parseResult = await xml2js.parseStringPromise(xml);
    const processMessage = deriveProcessMessage(parseResult);
    const [messageIntP] = processMessage[`as:AgMessage_int_p`];
    const agInputString = processMessage[`as:AgInput_obj_p`][0];
    const agInputData = await xml2js.parseStringPromise(agInputString);

    return {
      messageIntP: parseInt(messageIntP),
      inputData: sanitizeGenericCDataObject(agInputData.xml)
    };
  } catch (e) {
    console.log(e.stack);
    return null;
  }
};
