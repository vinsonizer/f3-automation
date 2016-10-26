var SHEET_ID = "com.f3nation.automation.SHEET_ID";

function _init() {
  var sheetId = SpreadsheetApp.getActiveSpreadsheet().getId();
  PropertiesService.getDocumentProperties().setProperty(SHEET_ID, sheetId);
}

function getSpreadsheet() {
  return SpreadsheetApp.openById(PropertiesService.getDocumentProperties().getProperty(SHEET_ID));
}

function setupRetweets(searchString, callback) {
  setupTweetSearch(searchString, function(err, tweets) {
    if (err) {
      callback(err);
    } else {
      tweets.forEach(function(tweet, idx) {
        twitter.retweet(tweet.id_str, function(err, newTweet) {
          callback(err, newTweet);
        });
      });
    }
  });
}

function setupTweetSearch(searchString, callback) {
  twitter.searchForTweets(searchString, function(err, tweets) {
    callback(err, tweets);
  });
}

function checkBackblasts(callback) {
  backblast.checkForUpdates(function(err, updates) {
    callback(err, updates);
  });
}

function getTrelloContent(callback) {
  trello.getNewsletterContent(function(err, cardStack) {
    var cardsToString = function(listName, cards) {
      var concatCards = function(fullContent, card) {
        return fullContent + card.desc + "\n\n---\n\n";
      };
      var content = cards.reduce(concatCards, "# " + listName + "\n\n---\n\n");
      return content;
    };
    var converter = new GASShowdown.Showdown.converter();
    callback(err, services.wrapHtml(cardStack.map(function(content) {
      return converter.makeHtml(cardsToString(content.listName, content.cards));
    }).join("")));
  });
}

function oauthCallbackHandler(serviceArgs, request) {
  services.handleOauthCallback(serviceArgs, request, function(err, authorized) {
    if (err) {
      showSideBar("Error in service callback: " + err);
    } else if (authorized) {
      showSideBar("Authorization Successful");
    } else {
      showSideBar("Authorization Denied");
    }
  });
}

function twitterAuthCallback(request) {
  oauthCallbackHandler(twitter.getServiceArgs(), request);
}

function twitterResetAuth() {
  services.resetOauth(twitter.getServiceArgs());
}

function trelloResetAuth() {
  services.resetOauth(trello.getServiceArgs());
}

function trelloAuthCallback(request) {
  oauthCallbackHandler(trello.getServiceArgs(), request);
}

function getConfig() {
  return config.getConfiguration();
}

function showSideBar(content) {
  var html = HtmlService.createHtmlOutput(content)
    .setTitle('F3 Nation')
    .setWidth(300);
  SpreadsheetApp.getUi() // Or DocumentApp or FormApp.
    .showSidebar(html);
}
