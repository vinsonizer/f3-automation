/*jslint node: true */
"use strict";


// in node, and fixes for jslint
if (typeof module !== 'undefined') {
  var trello = require('./trello');
  var twitter = require('./twitter');
  var config = require('./config');
  var services = require('./services');
  var backblast = require('./backblast');
  var SpreadsheetApp = {},
    PropertiesService = {},
    GASShowdown = {},
    HtmlService = {};
}

var SHEET_ID = "com.f3nation.automation.SHEET_ID";

/*jslint nomen: true*/
function _init() {
  var sheetId = SpreadsheetApp.getActiveSpreadsheet().getId();
  PropertiesService.getDocumentProperties().setProperty(SHEET_ID, sheetId);
}
/*jslint nomen: false*/

function getSpreadsheet() {
  return SpreadsheetApp.openById(PropertiesService.getDocumentProperties().getProperty(SHEET_ID));
}

function setupTweetSearch(searchString, callback) {
  twitter.searchForTweets(searchString, function (err, tweets) {
    callback(err, tweets);
  });
}

function setupRetweets(searchString, callback) {
  setupTweetSearch(searchString, function (err, tweets) {
    if (err) {
      callback(err);
    } else {
      tweets.forEach(function (tweet, idx) {
        twitter.retweet(tweet.id_str, function (err, newTweet) {
          callback(err, newTweet);
        });
      });
    }
  });
}

function checkBackblasts(callback) {
  backblast.checkForUpdates(function (err, updates) {
    callback(err, updates);
  });
}

function getTrelloContent(callback) {
  trello.getNewsletterContent(function (err, cardStack) {
    var cardsToString = function (listName, cards) {
      var concatCards = function (fullContent, card) {
        return fullContent + card.desc + "\n\n---\n\n";
      },
        content = cards.reduce(concatCards, "# " + listName + "\n\n---\n\n");
      return content;
    },
      converter = new GASShowdown.Showdown.converter();
    callback(err, services.wrapHtml(cardStack.map(function (content) {
      return converter.makeHtml(cardsToString(content.listName, content.cards));
    }).join("")));
  });
}

function addTrelloCard(content, callback) {
  trello.addCardToInbox(content, callback);
}

function showSideBar(content) {
  var html = HtmlService.createHtmlOutput(content)
    .setTitle('F3 Nation')
    .setWidth(300);
  SpreadsheetApp.getUi() // Or DocumentApp or FormApp.
    .showSidebar(html);
}

function oauthCallbackHandler(serviceArgs, request) {
  services.handleOauthCallback(serviceArgs, request, function (err, authorized) {
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

