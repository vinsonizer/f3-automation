/*
 * A Google Apps Script to subscribe to a Regional F3 RSS feed.  It will
 * parse the feed and look for new entries.  For each new entry, it will
 * pull the HTML for the backblast and parse out relevant info for tracking.
 *
 * @author Gears (Jason Vinson).
 */

var backblast = {};

// Running in Node
if (typeof module !== 'undefined') {
  var services = require('./services');
  var config = require('./config');
  module.exports = backblast;
}


backblast.checkForUpdates = function(callback) {

  var getItems = function(feed) {
    var doc = services.parseXml(feed);
    return doc.getRootElement().getChild('channel').getChildren('item');
  };

  var getAdditionalData = function(body) {

    var clean = function(input) {
      var result = input.toLowerCase()
        .replace(/\(?yhc|qic|respect|2.0|fng\)?/, "")
        .replace(/[^A-Za-z0-9]/g, "").trim();
      return result;
    };

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
      paxList = paxMatch[1].split(",").map(clean);
      paxCount = paxList.length;
    }
    if (qicMatch) {
      var theMatch = qicMatch[1].split(/and|,/);
      qic = theMatch.map(function(thing) {
        return clean(thing);
      }, this);
      for (var i = 0; i < qic.length; i++) {
        if (paxList.indexOf(qic[i]) === -1) {
          paxCount++;
          paxList.push(qic[i]);
        }
      }
    }
    var dt = new Date();
    if(whenMatch) {
      when = new Date(whenMatch);
      // silly javascript...
      if (when.getFullYear() < 1970) {
        when.setFullYear(when.getFullYear() + 100);
      }
    } else when = new Date();

    return {
      date: when,
      paxCount: paxCount,
      paxList: paxList
    };
  };

  var url = config.getConfiguration().backblast.feedUrl;
  var feed = services.fetch(url);
  var items = getItems(feed);
  var i = items.length - 1;
  var result = [];

  while (i > -1) {
    var item = items[i--];

    var bbLink = item.getChildText("link");
    var body = services.fetch(bbLink);
    var additional = getAdditionalData(body);

    var pubDate = new Date(item.getChildText('pubDate'));

    if (additional.paxCount > 1) {
      result.push({
        workoutDate: additional.date,
        bbDate: pubDate,
        bbLink: bbLink,
        paxList: additional.paxList,
        categories: item.getChildren('category').map(function(cat) {
          return cat.getText();
        })
      });
    }
  }
  // TODO: Error handling?
  callback(undefined, result);
};