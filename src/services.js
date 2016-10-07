var services = {};

services.fetch = function(url, oauthservice, opts) {
  var result = "";
  if (oauthservice) {
    result = oauthservice.fetch(url, opts);
  } else {
    result = UrlFetchApp.fetch(url).getContentText();
  }
  return result;
};

services.parse_xml = function(xml) {
  return XmlService.parse(xml);
};

// this block is for when running in node outside of GAS
if (typeof exports !== 'undefined') {
  exports.services = services;
}
