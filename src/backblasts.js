/*
 * A Google Apps Script to subscribe to a Regional F3 RSS feed.  It will
 * parse the feed and look for new entries.  For each new entry, it will
 * pull the HTML for the backblast and parse out relevant info for tracking.
 *
 * @author Gears (Jason Vinson)
 *
 * config is a global config object.  Anyone who adopts this script should
 * only have to change these three values to get this working for their region.
 *
 * url: Feed by region, if you go to your schedules landing page you find it
 *
 * fileId: File Id for Google sheet.  Open Sheet in browser and copy
 * string after the d/ up to /edit
 *
 * sheetName: Name of the sheet inside the google sheet, assumes Columns are:
 *  Date, Categories, Count, Url
 */
var config = {
    url: "http://f3nation.com/locations/fort-mill-sc/feed/",
    fileId: "1B5l_olGDsHI8fL_kzR9h4V5lFrJysB3a6xvU7sct7lk",
    sheetName: "BB Counts"
};


/**
 * Main function that should be invoked by trigger
 */
function checkBackblasts() {
    var url = config.url;
    main(url);
}


/**
 * Main fuction to drive the logic for the script.
 * Most of this code was originally contributed by Wingman (Trent Jones)
 *
 * @param {String} url The RSS URL to monitor
 *
 * Credit: https://gist.github.com/agektmr
 */
function main(url) {

    var ss = getSheet();

    var property = PropertiesService.getScriptProperties();
    var last_update = property.getProperty('last_update');
    last_update = last_update === null ? 0 : parseFloat(last_update);

    var feed = UrlFetchApp.fetch(url).getContentText();
    var items = getItems(feed);
    var i = items.length - 1;
    var date = new Date();
    while (i > -1) {
        var item = items[i--];
        date = new Date(item.getChildText('pubDate'));
        if (date.getTime() > last_update) {
            insertRow(item, ss);
        }
    }
    property.setProperty('last_update', date.getTime());
}

/**
 * Get the configured sheet object to write to.
 * @return {Object} configured sheet reference.
 */
function getSheet() {
    var file = SpreadsheetApp.openById(config.fileId);
    var sheet = file.getSheetByName(config.sheetName);
    return sheet;
}

/**
 * Takes text of an RSS feed, parses to XML objects and then returns
 * and array of items for processing
 *
 * @param {String} feed A textual representation of an RSS feed.
 * @return {Object} Array of items for processing.
 */
function getItems(feed) {
    var doc = XmlService.parse(feed);
    var root = doc.getRootElement();
    var channel = root.getChild('channel');
    var items = channel.getChildren('item');
    return items;
}

/**
 * Takes an item and a sheet reference.  Inserts the item values in row two,
 * basically dynamically growing the sheet in a Stack (LIFO) apprach.
 *
 * @param {Object} item an XML object representing a feed item
 * @param {Object} sheet a reference to the configured Google sheet
 */

function insertRow(item, sheet) {
    var title = item.getChildText('title');
    var url = item.getChildText('link');
    var author = item.getChildText('author');


    var additional = getAdditionalData(item);
    var date = new Date(item.getChildText('pubDate'));
    sheet.insertRowBefore(2);
    sheet.getRange('A2:D2').setValues([
        [
            additional.date, additional.category, additional.paxCount, url
        ]
    ]);
}

/**
 * This function takes an RSS feed item, connects to the URL of the feed
 * entry.  It then uses regex to pull the date and the pax count from the HTML
 * as well as the category from the feed object.
 *
 * @param {Object} item XML object representing the feed item
 * @return {Object} an object with the date, pax count, pax list, and Categories
 */
function getAdditionalData(item) {
    var url = item.getChildText('link');
    var body = UrlFetchApp.fetch(url).getContentText();

    var paxRegex = /The PAX:<\/strong>([^<]*)<\/li>/;
    var whenRegex = /When:<\/strong>([^<]*)<\/li>/;
    var paxList = "";
    var paxCount = 0;
    var when = "";
    var paxMatch = paxRegex.exec(body);
    var whenMatch = whenRegex.exec(body) && whenRegex.exec(body).length > 0 ? whenRegex.exec(body)[1].trim() : '';
    if (paxMatch) {
        // in case we ever want to capture the actual pax list
        paxList = paxMatch[1];
        paxCount = paxList.split(",").length;
    }
    if (whenMatch) {
        when = whenMatch;
    }

    var cats = item.getChildren('category');

    var c = "";
    for (var i = 0; i < cats.length; i++) {
        c = cats[i].getText();
    }

    return {
        date: when,
        paxCount: paxCount,
        paxList: paxList,
        category: c
    };
}
