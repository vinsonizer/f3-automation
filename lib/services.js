var services = {};

services.fetch = function(url, opts, oauthservice) {
  var result = "";
  if (oauthservice) {
    result = oauthservice.fetch(url, opts);
  } else {
    result = UrlFetchApp.fetch(url).getContentText();
  }
  return result;
};

services.parseXml = function(xml) {
  return XmlService.parse(xml);
};

services.createOauthService = function(args, callback) {
  var service = OAuth1.createService(args.service_name)
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
  // TODO: error handling?
  callback(null, service);
};

services.webExec = function(serviceArgs, url, opts, callback) {
  services.createOauthService(serviceArgs, function(err, service) {
    if (err) {
      callback(err);
    } else if (!service.hasAccess()) {
      callback(new Error("Access Exception: " + service.authorize()), service);
    } else {
      var result;
      try {
        result = services.fetch(url, opts, service);
      } catch (error) {
        err = error;
      }
      callback(err, result);
    }
  });
};

services.handleOauthCallback = function(serviceArgs, request, callback) {
  services.createOauthService(serviceArgs, function(err, service) {
    if (err) {
      callback(err);
    } else callback(err, service.handleCallback(request));
  });
};

services.resetOauth = function(serviceArgs) {
  services.createOauthService(serviceArgs, function(err, service) {
    service.reset();
  });
};

services.wrapHtml = function(body) {
  return "<html><head>" +
    "<link rel='stylesheet' href='//netdna.bootstrapcdn.com/bootstrap/3.0.1/css/bootstrap.min.css'></link>" +
    "<script type='javascript' href='https://code.jquery.com/jquery-3.0.0.min.js'></script>" +
    "<meta name='viewport' content='width=device-width, initial-scale=1, user-scalable=no'></meta>" +
    "<title>Newsletter Content</title></head><body><div class='container'>" +
    body + "</container></body></html>";
};

services.showSideBar = function(content) {
  var html = HtmlService.createHtmlOutput(content)
    .setTitle('F3 Nation')
    .setWidth(300);
  SpreadsheetApp.getUi() // Or DocumentApp or FormApp.
    .showSidebar(html);
};


if (typeof module !== 'undefined') {
  module.exports = services;
}
