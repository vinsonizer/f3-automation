var SHEET_ID = "com.f3nation.automation.SHEET_ID";

function _init() {
  var sheetId = SpreadsheetApp.getActiveSpreadsheet().getId();
  PropertiesService.getDocumentProperties().setProperty(SHEET_ID, sheetId);
}

function getSpreadsheet() {
  return SpreadsheetApp.openById(PropertiesService.getDocumentProperties().getProperty(SHEET_ID));
}
