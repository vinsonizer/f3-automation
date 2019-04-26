/*
 * A Google Apps Script to subscribe to a Regional F3 RSS feed.  It will
 * parse the feed and look for new entries.  For each new entry, it will
 * pull the HTML for the backblast and parse out relevant info for tracking.
 *
 * @author Gears (Jason Vinson).
 */

var backblast = {}

// running in node
if (typeof module !== 'undefined') {
  var services = require('./services')
  var config = require('./config')
  module.exports = backblast
}

backblast.checkForUpdates = function (callback) {
  var getItems = function (feed) {
    var doc = services.parseXml(feed)
    return doc.getRootElement().getChild('channel').getChildren('item')
  }

  var getWorkoutDate = function (body) {
    var whenRegex = /class="workout_date">([^<]*)<\/span>/
    var when = ''
    var whenMatch = whenRegex.exec(body) && whenRegex.exec(body).length > 0 ? whenRegex.exec(body)[1].trim() : ''
    if (whenMatch) {
      when = new Date(whenMatch)
      // silly javascript...
      if (when.getFullYear() < 1970) {
        when.setFullYear(when.getFullYear() + 100)
      }
    } else when = new Date()

    return when
  }

  var url = config.getConfiguration().backblast.feedUrl
  var feed = services.fetch(url)
  var items = getItems(feed)
  var i = items.length - 1
  var result = []

  while (i >= 0) {
    var item = items[i--]

    var bbLink = item.getChildText('link')
    var body = services.fetch(bbLink)
    var workoutDate = getWorkoutDate(body)

    var pubDate = new Date(item.getChildText('pubDate'))
    var categories = item.getChildren('category')
    var paxList = []
    var catList = []
    var rawCats = []

    for (var j = 0; j < categories.length; j++) {
      var cat = categories[j]
      var catText = cat.getText()
      if (cat.getAttribute('domain')) {
        if (cat.getAttribute('domain').getValue() === 'category') {
          catList.push(catText)
        }
        if (cat.getAttribute('domain').getValue() === 'pax') {
          paxList.push(catText)
        }
      }
      rawCats.push(catText)
    }

    // old handler for feeds not yet supporting domain attribute
    if (catList.length === 0 && paxList.length === 0) {
      catList = rawCats
      paxList = catList ? catList.slice(1) : []
    }

    result.push({
      workoutDate: workoutDate,
      bbDate: pubDate,
      bbLink: bbLink,
      paxList: paxList,
      categories: catList
    })
  }

  // TODO: Error handling?
  callback(undefined, result)
}
