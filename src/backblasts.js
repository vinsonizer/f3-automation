/*
 * A Google Apps Script to subscribe to a Regional F3 RSS feed.  It will
 * parse the feed and look for new entries.  For each new entry, it will
 * pull the HTML for the backblast and parse out relevant info for tracking.
 *
 * @author Gears (Jason Vinson).
 */

// The config object comes from the defualt gulp task...

/**
 * Main function that should be invoked by trigger
 */
function checkBackblasts() {
  var config = getConfiguration();
  main(config.backblast_config);
}


/**
 * Main fuction to drive the logic for the script.
 * Most of this code was originally contributed by Wingman (Trent Jones)
 *
 * @param {Object} cfg Configuration Object with all settings for this to work
 *
 * Credit: https://gist.github.com/agektmr
 */
function main(cfg) {

  var url = cfg.url;
  var ss = getSheet(cfg);

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
 *
 * @param {Object} cfg Configuration Object with all settings for this to work
 * @return {Object} configured sheet reference.
 */
function getSheet(cfg) {
  var file = SpreadsheetApp.openById(cfg.fileId);
  var sheet = file.getSheetByName(cfg.countsSheetName);
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

  var qicRegex = /QIC:<\/strong>([^<]*)<\/li>/;
  var paxRegex = /The PAX:<\/strong>([^<]*)<\/li>/;
  var whenRegex = /When:<\/strong>([^<]*)<\/li>/;
  var paxList = "";
  var paxCount = 0;
  var when = "";
  var qic = "";
  var paxMatch = paxRegex.exec(body);
  var qicMatch = qicRegex.exec(body);
  var whenMatch = whenRegex.exec(body) && whenRegex.exec(body).length > 0 ? whenRegex.exec(body)[1].trim() : '';
  if (paxMatch) {
    // in case we ever want to capture the actual pax list
    paxList = paxMatch[1].split(",").map(clean);
    paxCount = paxList.length;
  }
  if (qicMatch) {
    qic = qicMatch[1];
    if (paxList && paxList.indexOf(qic) == -1) {
      paxCount++;
      paxList.push(qic);
    }
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

function clean(input) {
  return input.replace(/[^A-Za-z0-9]/g, "").toLowerCase().trim();
}

if (typeof exports !== 'undefined') {
  exports.clean = clean;
  exports.getAdditionalData = getAdditionalData;
  exports.getItems = getItems;
  exports.main = main;
}
