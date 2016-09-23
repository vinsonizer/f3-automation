var SHEET_ID = "com.f3nation.automation.SHEET_ID";
var TWITTER_CONSUMER_SECRET = "com.f3nation.automation.TWITTER_CONSUMER_SECRET";
var TWITTER_CONSUMER_KEY = "com.f3nation.automation.TWITTER_CONSUMER_KEY";
var TRELLO_CONSUMER_SECRET = "com.f3nation.automation.TWITTER_CONSUMER_SECRET";
var TRELLO_CONSUMER_KEY = "com.f3nation.automation.TWITTER_CONSUMER_KEY";

function _init() {
  var sheetId = SpreadsheetApp.getActiveSpreadsheet().getId();
  PropertiesService.getDocumentProperties().setProperty(SHEET_ID, sheetId);
}

function getSpreadsheet() {
  return SpreadsheetApp.openById(PropertiesService.getDocumentProperties().getProperty(SHEET_ID));
}

function onOpen() {
  _init();
  var ui = SpreadsheetApp.getUi();
  ui.createMenu('F3 Nation')
      .addSubMenu(ui.createMenu('Backblasts')
           .addItem('Update Polling Schedule', 'F3Automation.scheduleBackblastPolling')
           .addSeparator()
           .addItem('Manually Check Backblasts', 'F3Automation.backblastsCheckForUpdates')
            )
      .addSeparator()
      .addSubMenu(ui.createMenu('Twitter')
           .addItem('Update Polling Schedule', 'F3Automation.scheduleTwitterPolling')
           .addSeparator()
           .addItem('Manually Pull Twitter Counts', 'F3Automation.twitterCountsPolling')
           .addSeparator()
           .addItem('Reset Twitter Auth', 'F3Automation.twitterResetAuth')
            )
      .addSeparator()
      .addSubMenu(ui.createMenu('Trello')
           .addItem('Get Trello Content', 'F3Automation.trelloShowContent')
           .addSeparator()
           .addItem('Reset Trello Auth', 'F3Automation.trelloResetAuth')
            )
      .addToUi();
}

function scheduleBackblastPolling() {
  var triggers = ScriptApp.getProjectTriggers();
  for(var i = 0; i < triggers.length; i++) {
    if(triggers[i].getHandlerFunction() === "backblastsCheckForUpdates") {
      ScriptApp.deleteTrigger(triggers[i]);
    }
  }
  ScriptApp.newTrigger("backblastsCheckForUpdates")
    .timeBased()
    .everyHours(
        getConfig().backblast_config.updateFrequency
    ).create();
}

function scheduleTwitterPolling() {
  var triggers = ScriptApp.getProjectTriggers();
  for(var i = 0; i < triggers.length; i++) {
    if(
      triggers[i].getHandlerFunction() === "twitterCountsPolling" ||
      triggers[i].getHandlerFunction() === "twitterProcessRetweets") {
      ScriptApp.deleteTrigger(triggers[i]);
    }
  }
  ScriptApp.newTrigger("twitterCountsPolling")
    .timeBased()
    .everyMinutes(
        getConfig().twitter_config.updateFrequency
    ).create();
    ScriptApp.newTrigger("twitterProcessRetweets")
      .timeBased()
      .everyMinutes(
          getConfig().twitter_config.updateFrequency
      ).create();
}
