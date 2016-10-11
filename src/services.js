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

services.parse_json = function(xml) {
  return JSON.parse(xml);
};

services.get_oauth_service = function(args) {
  return OAuth1.createService(args.service_name)
    // Set the endpoint URLs.
    .setAccessTokenUrl(args.access_token_url)
    .setRequestTokenUrl(args.request_token_url)
    .setAuthorizationUrl(args.authorization_url)
    // Set the consumer key and secret.
    .setConsumerKey(args.consumer_key)
    .setConsumerSecret(args.consumer_secret)
    // Set the name of the callback function in the script referenced
    // above that should be invoked to complete the OAuth flow.
    .setCallbackFunction(args.callback_function)
    // Set the property store where authorized tokens should be persisted.
    .setPropertyStore(PropertiesService.getUserProperties());
};

services.oauth_callback_handler = function(serviceCallback, request) {
  var service = serviceCallback();
  var authorized = service.handleCallback(request);
  if (authorized) {
    return HtmlService.createHtmlOutput('Success!');
  } else {
    return HtmlService.createHtmlOutput('Denied');
  }
};

services.oauth_reset = function(serviceCallback) {
  var service = serviceCallback();
  service.reset();
};

services.log = function(message) {
  Logger.log(message);
};

// this block is for when running in node outside of GAS
if (typeof exports !== 'undefined') {
  exports.services = services;
}
