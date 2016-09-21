function getConfig() {
  var settingsSheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Settings");
  var bbRange = settingsSheet.getRange("B2:B5");
  var twitterRange = settingsSheet.getRange("B7:B11");
  var trelloRange = settingsSheet.getRange("B13:B20");
  var _getValue = function(range, offset) {
    return range.getCell(1+ offset, 1).getValue();
  };
  var baseUrl = _getValue(bbRange, 0);
  var config = {
    backblast_config: {
      feedUrl: baseUrl + "feed/",
      pageUrl: baseUrl + "page/",
      bbCountSheetName: _getValue(bbRange, 1),
      attendanceSheetName: _getValue(bbRange, 2),
    },
    trello_config: {
      consumerKey: _getValue(trelloRange, 0),
      consumerSecret: _getValue(trelloRange, 1),
      boardName: _getValue(trelloRange, 2),
      inboxList: _getValue(trelloRange, 3),
      newContentList: _getValue(trelloRange, 4),
      oldContentList: _getValue(trelloRange, 5),
      retiredContentList: _getValue(trelloRange, 6),
      expiration: _getValue(trelloRange, 7)
    },
    twitter_config: {
      tweetCountSheetName: _getValue(twitterRange, 0),
      consumerKey: _getValue(twitterRange, 1),
      consumerSecret: _getValue(twitterRange, 2),
      retweetMonitoringSearch: _getValue(twitterRange, 3),
      countsMonitoringSearch: _getValue(twitterRange, 4)
    }
  };
  return config;
}
