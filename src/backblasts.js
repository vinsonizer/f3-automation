/*
 * A Google Apps Script to subscribe to a Regional F3 RSS feed.  It will
 * parse the feed and look for new entries.  For each new entry, it will
 * pull the HTML for the backblast and parse out relevant info for tracking.
 *
 * @author Gears (Jason Vinson).
 */

var backblasts = {};

backblasts.checkForUpdates = function(cfg, dateGetter, dateSetter, countRowCallback, attendanceCallback) {

  var getItems = function(feed) {
    var doc = services.parse_xml(feed);
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
        if (paxList && paxList.indexOf(qic[i]) === -1) {
          paxCount++;
          paxList.push(qic[i]);
        }
      }
    }
    var dt = new Date();
    when = whenMatch || (dt.getMonth() + 1) + "/" + dt.getDate() + "/" + dt.getYear();

    return {
      date: when,
      paxCount: paxCount,
      paxList: paxList
    };
  };



  var check_date = new Date().toString();
  var url = cfg.feedUrl;
  var yesterday = new Date().getDate() - 1;
  var last_update = new Date(dateGetter()).getTime() || yesterday;

  var feed = services.fetch(url);
  var items = getItems(feed);
  var i = items.length - 1;
  var date = new Date();

  while (i > -1) {
    var item = items[i--];

    var bbLink = item.getChildText("link");
    var body = services.fetch(bbLink);
    var additional = getAdditionalData(body);

    date = new Date(item.getChildText('pubDate'));
    if (date.getTime() > last_update && additional.paxCount > 1) {
      countRowCallback([
        additional.date,
        item.getChildren('category').toString(),
        additional.paxCount,
        bbLink
      ]);
      if (attendanceCallback) {
        attendanceCallback([additional.date, bbLink, additional.paxList]);
      }
    }
  }
  dateSetter(check_date);

};

// this block is for when running in node outside of GAS
if (typeof exports !== 'undefined') {
  exports.backblasts = backblasts;
}
