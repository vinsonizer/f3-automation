var SHEET_ID = "com.f3nation.automation.SHEET_ID";
var TWITTER_CONSUMER_SECRET = "com.f3nation.automation.TWITTER_CONSUMER_SECRET";
var TWITTER_CONSUMER_KEY = "com.f3nation.automation.TWITTER_CONSUMER_KEY";
var TRELLO_CONSUMER_SECRET = "com.f3nation.automation.TWITTER_CONSUMER_SECRET";
var TRELLO_CONSUMER_KEY = "com.f3nation.automation.TWITTER_CONSUMER_KEY";

function _init() {
    var sheetId = SpreadsheetApp.getActiveSpreadsheet().getId();
    PropertiesService.getScriptProperties().setProperty(SHEET_ID, sheetId);
}

function getSpreadsheet() {
    return SpreadsheetApp.openById(PropertiesService.getScriptProperties().getProperty(SHEET_ID));
}
