/*
 * A Google Apps Script to subscribe to a Regional F3 RSS feed.  It will
 * parse the feed and look for new entries.  For each new entry, it will
 * pull the HTML for the backblast and parse out relevant info for tracking.
 *
 * @author Gears (Jason Vinson).
 */

/**
 * Main function that should be invoked by trigger
 */
function checkBackblasts() {
    new BackblastChecker(getConfig()).checkBackblasts();
}

function BackblastChecker(config) {
  this.cfg = config.backblast_config;
}

BackblastChecker.prototype = {
    constructor: BackblastChecker,
    /**
     * Main fuction to drive the logic for the script.
     * Most of this code was originally contributed by Wingman (Trent Jones)
     *
     * Credit: https://gist.github.com/agektmr
     */
    checkBackblasts: function() {

        var url = this.cfg.feedUrl;
        var countSheet = this.getCountsSheet();
        var attendSheet = this.getAttendanceSheet();

        var property = PropertiesService.getScriptProperties();
        var last_update = property.getProperty('last_update');
        last_update = last_update === null ? 0 : parseFloat(last_update);

        var feed = UrlFetchApp.fetch(url).getContentText();
        var items = this.getItems(feed);
        var i = items.length - 1;
        var date = new Date();
        while (i > -1) {
            var item = items[i--];

            var bbLink = item.getChildText("link");
            var body = UrlFetchApp.fetch(bbLink).getContentText();
            var additional = this.getAdditionalData(body);

            date = new Date(item.getChildText('pubDate'));
            if (date.getTime() > last_update) {
                this.insertCountRow(item, bbLink, body, additional, countSheet);
                for (var j = 0; j < additional.paxList.length; j++) {
                    this.insertOrUpdateAttendance(additional.paxList[j], additional.date, bbLink, attendSheet);
                }
            }
        }
        property.setProperty('last_update', date.getTime());
      SpreadsheetApp.getActiveSpreadsheet().getSheetByName(this.cfg.bbCountSheetName).getRange("G1:G1").setValues([[new Date().toString()]]);
    },

    /**
     * Get the configured sheet object to write to.
     *
     * @return {Object} configured sheet reference.
     */
    getCountsSheet: function() {
        var file = SpreadsheetApp.getActiveSpreadsheet();
        var sheet = file.getSheetByName(this.cfg.bbCountSheetName);
        return sheet;
    },

    getAttendanceSheet: function() {
        var file = SpreadsheetApp.getActiveSpreadsheet();
        var sheet = file.getSheetByName(this.cfg.attendanceSheetName);
        return sheet;
    },

    /**
     * Takes text of an RSS feed, parses to XML objects and then returns
     * and array of items for processing
     *
     * @param {String} feed A textual representation of an RSS feed.
     * @return {Object} Array of items for processing.
     */
    getItems: function(feed) {
        var doc = XmlService.parse(feed);
        var root = doc.getRootElement();
        var channel = root.getChild('channel');
        var items = channel.getChildren('item');
        return items;
    },

    /**
     * Takes an item and a sheet reference.  Inserts the item values in row two,
     * basically dynamically growing the sheet in a Stack (LIFO) apprach.
     *
     * @param {Object} item an XML object representing a feed item
     * @param {Object} sheet a reference to the configured Google sheet
     */

    insertCountRow: function(item, bbLink, body, additional, sheet) {
        var cats = item.getChildren('category');
        // only takes last for now...
        var category = cats[cats.length - 1].getText();
        if (additional.paxCount > 1) {
            sheet.insertRowBefore(2);
            sheet.getRange('A2:D2').setValues([
                [
                    additional.date, category, additional.paxCount, bbLink
                ]
            ]);
        }
    },

    insertOrUpdateAttendance: function(pax, bbDate, bbLink, sheet) {
        var range = sheet.getDataRange();
        var values = range.getValues();
        var notFound = true;
        for (var i = 0; i < values.length; i++) {
            if (values[i][0] === pax) {
                var rowNum = i + 1;
                this.updateAttendanceRecord(sheet, "A" + rowNum + ":D" + rowNum, pax, bbDate, bbLink, 1);
                notFound = false;
            }
        }
        if (notFound) {
            sheet.insertRowBefore(2);
            this.updateAttendanceRecord(sheet, 'A2:D2', pax, bbDate, bbLink, 1);
        }
    },

    updateAttendanceRecord: function(sheet, range, pax, bbDate, bbLink, count) {
        sheet.getRange(range).setValues([
            [
                pax, bbDate, bbLink, count
            ]
        ]);
    },

    seedAttendanceData: function() {
        var bbRegex = /class="indextitle">\W+<a href="([^"]*)" title/g;
        var attendSheet = this.getAttendanceSheet();
        for (var i = 1; i > 0; i--) {
            var url = this.cfg.pageUrl + i;
            var bbListBody = UrlFetchApp.fetch(url).getContentText();
            var match = bbRegex.exec(bbListBody);
            while (match !== null) {
                var bbLink = match[1];
                var bbBody = UrlFetchApp.fetch(bbLink).getContentText();
                var additional = this.getAdditionalData(bbBody);

                for (var j = 0; j < additional.paxList.length; j++) {
                    this.insertOrUpdateAttendance(additional.paxList[j], additional.date, bbLink, attendSheet);
                }

                match = bbRegex.exec(bbListBody);
            }
            Logger.log("finished page " + i);


        }

        // repeat this over and over...
    },

    /**
     * This function takes an RSS feed item, connects to the URL of the feed
     * entry.  It then uses regex to pull the date and the pax count from the HTML
     * as well as the category from the feed object.
     *
     * @param {Object} item XML object representing the feed item
     * @return {Object} an object with the date, pax count, pax list, and Categories
     */
    getAdditionalData: function(body) {
        var qicRegex = /QIC:<\/strong>([^<]*)<\/li>/;
        var paxRegex = /The PAX:<\/strong>([^<]*)<\/li>/;
        var whenRegex = /When:<\/strong>([^<]*)<\/li>/;
        var paxList = [];
        var paxCount = 0;
        var when = "";
        var qic = "";
        var paxMatch = paxRegex.exec(body);
        var qicMatch = qicRegex.exec(body);
        var whenMatch = whenRegex.exec(body) && whenRegex.exec(body).length > 0 ? whenRegex.exec(body)[1].trim() : '';
        if (paxMatch) {
            // in case we ever want to capture the actual pax list
            paxList = paxMatch[1].split(",").map(this.clean);
            paxCount = paxList.length;
        }
        if (qicMatch) {
            var theMatch = qicMatch[1].split(/and|,/);
            qic = theMatch.map(function(thing) {
                return this.clean(thing);
            }, this);
            for (var i = 0; i < qic.length; i++) {
                if (paxList && paxList.indexOf(qic[i]) === -1) {
                    paxCount++;
                    paxList.push(qic[i]);
                }
            }
        }
        when = whenMatch || new Date();

        return {
            date: when,
            paxCount: paxCount,
            paxList: paxList
        };
    },

    clean: function(input) {
        var result = input.toLowerCase()
            .replace(/\(?yhc|qic|respect|2.0|fng\)?/, "")
            .replace(/[^A-Za-z0-9]/g, "").trim();
        return result;
    }
};

// this block is for when running in node outside of GAS
if (typeof exports !== 'undefined') {
    exports.BackblastChecker = new BackblastChecker();
}
