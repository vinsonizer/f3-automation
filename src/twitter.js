//https://script.google.com/macros/d/1nA0fj4a8Fga-whToZEzeqOW0gwDvpSmhav66ZT1qUa37LvX6bLoSZTgW/usercallback

function TwitterClient(service, cfg) {
  this.propertyKey = cfg.consumerKey + '_latest_tweet_date';

  this.getLatestTweetDate = function() {
    var latestTweetDateStr = PropertiesService.getScriptProperties().getProperty(this.propertyKey) || '2016/01/01';
    var latestTweetDate = new Date(latestTweetDateStr);
    return latestTweetDate;
  };

  this.setLatestTweetDate = function(latestTweetDate) {
    // always check for the day prior, no way to include time component
    latestTweetDate.setDate(latestTweetDate.getDate() - 1);
    PropertiesService.getScriptProperties().setProperty(this.propertyKey, latestTweetDate.toString());
    Logger.log("Latest Retweet Date set to " + latestTweetDate.toString());
  };


  this.searchForTweets = function() {
    var latestTweetDate = this.getLatestTweetDate();
    var sinceDate = latestTweetDate.getFullYear() + "-" + (latestTweetDate.getMonth() + 1) + "-" + latestTweetDate.getDate();
    var url = 'https://api.twitter.com/1.1/search/tweets.json?q=' + encodeURIComponent(cfg.retweetMonitoringSearch + " since:" + sinceDate);
    var response = service.fetch(url, {
      method: 'get'
    });
    var tweets = JSON.parse(response.getContentText()).statuses;
    Logger.log("Found " + tweets.length + " for query with since date of " + sinceDate);
    return tweets;
  };

  this.retweet = function(tweet) {
    var rt_url = 'https://api.twitter.com/1.1/statuses/retweet/' + tweet.id_str + '.json';
    var rt_response = service.fetch(rt_url, {
      method: 'post'
    });
    var rt_result = JSON.parse(rt_response.getContentText());
  };

  this.processRetweets = function() {
    var latestTweetDate = this.getLatestTweetDate();
    if (service.hasAccess()) {
      var tweets = this.searchForTweets();
      for (var i = tweets.length - 1; i >= 0; i--) {
        try {
          var tweet = tweets[i];
          Logger.log("Found tweet from " + tweet.created_at + " with text: " + tweet.text);
          var tweetDate = new Date(tweet.created_at);
          if (tweetDate > latestTweetDate) {
            latestTweetDate = tweetDate;
            this.retweet(tweet);
          }
        } catch (error) {
          Logger.log(cfg.consumerKey + " => " + error);
        }
      }
      this.setLatestTweetDate(latestTweetDate);
    } else {
      var authorizationUrl = service.authorize();
      Logger.log('Open the following URL and re-run the script: %s',
        authorizationUrl);
    }
  };
}

// encapsulation for testing
function TwitterService() {

  /**
   * Reset the authorization state, so that it can be re-tested.
   */
  this.reset = function() {
    var service = getService();
    service.reset();
  };

  /**
   * Configures the service.
   */
  this.getService = function() {
    var cfg = getConfiguration().twitter_config;
    return OAuth1.createService('Twitter')
      // Set the endpoint URLs.
      .setAccessTokenUrl('https://api.twitter.com/oauth/access_token')
      .setRequestTokenUrl('https://api.twitter.com/oauth/request_token')
      .setAuthorizationUrl('https://api.twitter.com/oauth/authorize')
      // Set the consumer key and secret.
      .setConsumerKey(cfg.consumerKey)
      .setConsumerSecret(cfg.consumerSecret)
      // Set the name of the callback function in the script referenced
      // above that should be invoked to complete the OAuth flow.
      .setCallbackFunction('authCallback')
      // Set the property store where authorized tokens should be persisted.
      .setPropertyStore(PropertiesService.getUserProperties());
  };

  /**
   * Handles the OAuth callback.
   */
  this.authCallback = function(request) {
    var service = getService();
    var authorized = service.handleCallback(request);
    if (authorized) {
      return HtmlService.createHtmlOutput('Success!');
    } else {
      return HtmlService.createHtmlOutput('Denied');
    }
  };
}

function authCallback(request) {
  new TwitterService().authCallback(request);
}

function reset() {
  new TwitterService().reset();
}

function processRetweets() {
  var client = new TwitterClient(new TwitterService().getService(), getConfiguration().twitter_config);
  client.processRetweets();
}

// this block is for when running in node outside of GAS
if (typeof exports !== 'undefined') {
  exports.TwitterService = TwitterService;
  exports.TwitterClient = TwitterClient;
}
