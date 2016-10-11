var SHEET_ID = "com.f3nation.automation.SHEET_ID";

function _init() {
  var sheetId = SpreadsheetApp.getActiveSpreadsheet().getId();
  PropertiesService.getDocumentProperties().setProperty(SHEET_ID, sheetId);
}

function getSpreadsheet() {
  return SpreadsheetApp.openById(PropertiesService.getDocumentProperties().getProperty(SHEET_ID));
}

// exported methods for sheets:
function backblastsCheckForUpdates() {
  backblasts.checkForUpdates(
    getConfig().backblast_config,
    function() {
      return getSpreadsheet()
        .getSheetByName(this.cfg.bbCountSheetName)
        .getRange("G1:G1").getCell(1, 1).getValue();
    },
    function(newDate) {
      getSpreadsheet()
        .getSheetByName(this.cfg.bbCountSheetName)
        .getRange("G1:G1").getCell(1, 1).setValue(newDate);
    },
    function(rowValues) {
      var sheet = getSpreadsheet().getSheetByName(cfg.bbCountSheetName);
      sheet.insertRowBefore(2);
      sheet.getRange('A2:D2').setValues([rowValues]);
    },
    function(rowValues) {
      var bbDate = rowValues[0];
      var bbLink = rowValues[1];
      var paxList = rowValues[2];

      var sheet = getSpreadsheet().getSheetByName(cfg.attendanceSheetName);

      var dataRange = sheet.getDataRange();
      var values = dataRange.getValues();
      for (var j = 0; j < paxList.length; j++) {
        var pax = paxList[j];
        var targetRange = 'A2:D2';
        var notFound = true;
        var attendanceCount = 0;
        for (var i = 0; i < values.length; i++) {
          if (values[i][0] === pax) {
            var rowNum = i + 1;
            targetRange = "A" + rowNum + ":D" + rowNum;
            attendanceCount = values[i][3];
            notFound = false;
          }
        }
        if (notFound) {
          sheet.insertRowBefore(2);
        }
        sheet.getRange(targetRange).setValues([
          [
            pax, bbDate, bbLink, attendanceCount + 1
          ]
        ]);
      }
    }
  );
}

function twitterAuthCallback(request) {
  services.oauth_callback_handler(twitter.get_service, request);
}
