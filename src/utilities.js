function wrapHtml(body) {
  return "<html><head>" +
    "<link rel='stylesheet' href='//netdna.bootstrapcdn.com/bootstrap/3.0.1/css/bootstrap.min.css'></link>" +
    "<script type='javascript' href='https://code.jquery.com/jquery-3.0.0.min.js'></script>" +
    "<meta name='viewport' content='width=device-width, initial-scale=1, user-scalable=no'></meta>" +
    "<title>Newsletter Content</title></head><body><div class='container'>" +
    body + "</container></body></html>";
}

function showAuthDialog(authorizationUrl) {
  var htmlOutput = HtmlService
    .createHtmlOutput(wrapHtml('<p>Click <a href="' + authorizationUrl + '" target="_blank">Here</a> to Authorize</p>'))
    .setWidth(250)
    .setHeight(300);
  SpreadsheetApp.getUi().showModalDialog(htmlOutput, "Authorization Required");
}
