const ingestSoapXML = require("../ingestSoap");
const testXML = `<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:as="http://www.deere.com/agriservices/">
<soapenv:Body>
  <as:ProcessMessage>
    <as:AgContext_str_p><![CDATA[<xml>
<login dataset="001" userid="MOB" password="Password1234" version="" datapath="" supportpath="" userprogpath="" workpath="" database="" remoteuserid="" domain="" url="http://localhost:8080/agris/services/BinManagement" proxyservername="" proxyuserid="ai00" proxyuserpassword="" proxyuserdomain="" portnumber="80" agrianuser="" agrianpassword="" regulatorypath="" log="N" loglevel="1" />
</xml>]]></as:AgContext_str_p>
    <as:AgMessage_int_p>80150</as:AgMessage_int_p>
    <as:AgInput_obj_p><![CDATA[<xml>
<input usefile="false" usefilepath="" />
<contract contractlocation="380" contractnumber="9651A00" />
<scheduledetail>true</scheduledetail>
<trancodedetail>true</trancodedetail>
<discountdetail>true</discountdetail>
<pricingremarkdetail>true</pricingremarkdetail>
<discounttabledetail>true</discounttabledetail>
<remarkdetail>true</remarkdetail>
<amendmentnotedetail>true</amendmentnotedetail>
</xml>]]></as:AgInput_obj_p>
  </as:ProcessMessage>
</soapenv:Body>
</soapenv:Envelope>
`;

test("ingests sample XML", async () => {
  const result = await ingestSoapXML(testXML);
  const agInputString =
    result[`soapenv:Envelope`][`soapenv:Body`][0][`as:ProcessMessage`][0][
      `as:AgInput_obj_p`
    ][0];
  const agInputData = await ingestSoapXML(agInputString);
  expect(
    result[`soapenv:Envelope`][`soapenv:Body`][0][`as:ProcessMessage`][0][
      `as:AgMessage_int_p`
    ]
  ).toEqual(["80150"]);
  expect(agInputData.xml.input).toEqual([
    {
      $: { usefile: "false", usefilepath: "" }
    }
  ]);
  expect(agInputData.xml.contract).toMatchObject([
    { $: { contractlocation: "380", contractnumber: "9651A00" } }
  ]);

  [
    "scheduledetail",
    "trancodedetail",
    "discountdetail",
    "pricingremarkdetail",
    "discounttabledetail",
    "remarkdetail",
    "amendmentnotedetail"
  ].forEach(property => {
    expect(agInputData.xml[property]).toEqual(["true"]);
  });
});
