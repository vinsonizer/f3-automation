function getConfig() {
    var settingsSheet = getSpreadsheet().getSheetByName("Settings");
    var bbRange = settingsSheet.getRange("B2:B5");
    var twitterRange = settingsSheet.getRange("B7:B12");
    var trelloRange = settingsSheet.getRange("B14:B21");
    var properties = PropertiesService.getDocumentProperties();
    var _getValue = function(range, offset) {
        return range.getCell(1 + offset, 1).getValue();
    };
    var _getOrReplace = function(cell, key) {
        if (cell.getValue()) {
            properties.setProperty(key, cell.getValue());
            cell.setValue("");
        }
        return properties.getProperty(key);
    };
    var baseUrl = _getValue(bbRange, 0);
    var config = {
        backblast_config: {
            feedUrl: baseUrl + "feed/",
            pageUrl: baseUrl + "page/",
            bbCountSheetName: _getValue(bbRange, 1),
            attendanceSheetName: _getValue(bbRange, 2),
            updateFrequency: _getValue(bbRange, 3)
        },
        trello_config: {
            consumerKey: _getOrReplace(trelloRange.getCell(1, 1), TRELLO_CONSUMER_KEY),
            consumerSecret: _getOrReplace(trelloRange.getCell(2, 1), TRELLO_CONSUMER_SECRET),
            boardName: _getValue(trelloRange, 2),
            inboxList: _getValue(trelloRange, 3),
            newContentList: _getValue(trelloRange, 4),
            oldContentList: _getValue(trelloRange, 5),
            retiredContentList: _getValue(trelloRange, 6),
            expiration: _getValue(trelloRange, 7)
        },
        twitter_config: {
            tweetCountSheetName: _getValue(twitterRange, 0),
            consumerKey: _getOrReplace(twitterRange.getCell(2, 1), TWITTER_CONSUMER_KEY),
            consumerSecret: _getOrReplace(twitterRange.getCell(3, 1), TWITTER_CONSUMER_SECRET),
            retweetMonitoringSearch: _getValue(twitterRange, 3),
            countsMonitoringSearch: _getValue(twitterRange, 4),
            updateFrequency: _getValue(twitterRange, 5)
        }
    };
    return config;
}
