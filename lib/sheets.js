function setupRetweets(searchString, callback) {
  setupTweetSearch(searchString, function(err, tweets) {
    tweets.forEach(function(idx, tweet) {
      twitter.retweet(tweet.id_str, function(err, newTweet) {
        callback(err, newTweet);
      });
    });
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
  var cfg = config.getConfiguration().trello;
  trello.getBoards(function(err, boards) {
    var targetBoardId = (boards.filter(function(board, index) {
      return board.name == cfg.boardName;
    }))[0].id;

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
  oauthCallbackHandler(twitter.getServiceArgs, request);
}

function trelloAuthCallback(request) {
  oauthCallbackHandler(trello.getServiceArgs, request);
}

function showSideBar(content) {
  var html = HtmlService.createHtmlOutput(content)
    .setTitle('F3 Nation')
    .setWidth(300);
  SpreadsheetApp.getUi() // Or DocumentApp or FormApp.
    .showSidebar(html);
}
