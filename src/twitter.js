//https://script.google.com/macros/d/1nA0fj4a8Fga-whToZEzeqOW0gwDvpSmhav66ZT1qUa37LvX6bLoSZTgW/usercallback

// TODO: Rate Limit to 15 minutes...
function processRetweets() {

  var cfg = getConfiguration().twitter_config;
  var propertyKey = cfg.consumerKey + '_latest_tweet_date';
  var properties = PropertiesService.getScriptProperties();

  var latestTweetDateStr = properties.getProperty(propertyKey) || '2016/01/01';
  var latestTweetDate = new Date(latestTweetDateStr);

  var service = getService();
  if (service.hasAccess()) {
    var sinceDate = latestTweetDate.getFullYear() + "-" + (latestTweetDate.getMonth() + 1) + "-" + latestTweetDate.getDate();
    var url = 'https://api.twitter.com/1.1/search/tweets.json?q=' + encodeURIComponent(cfg.retweetMonitoringSearch + " since:" + sinceDate);
    var response = service.fetch(url, {
      method: 'get'
    });
    var tweets = JSON.parse(response.getContentText()).statuses;
    Logger.log("Found " + tweets.length + " for query with since date of " + sinceDate);
    for (var i = tweets.length - 1; i >= 0; i--) {
      try {
        var tweet = tweets[i];
        Logger.log("Found tweet from " + tweet.created_at + " with text: " + tweet.text);
        var tweetDate = new Date(tweet.created_at);
        if (tweetDate > latestTweetDate) {
          latestTweetDate = tweetDate;
          var rt_url = 'https://api.twitter.com/1.1/statuses/retweet/' + tweet.id_str + '.json';
          var rt_response = service.fetch(rt_url, {
            method: 'post'
          });
          var rt_result = JSON.parse(rt_response.getContentText());
        }
      } catch (error) {
        Logger.log(cfg.consumerKey + " => " + error);
      }
    }
    // always check for the day prior, no way to include time component
    latestTweetDate.setDate(latestTweetDate.getDate() - 1);
    properties.setProperty(propertyKey, latestTweetDate.toString());
    Logger.log("Latest Retweet Date set to " + properties.getProperty(propertyKey));
  } else {
    var authorizationUrl = service.authorize();
    Logger.log('Open the following URL and re-run the script: %s',
      authorizationUrl);
  }
}

/**
 * Reset the authorization state, so that it can be re-tested.
 */
function reset() {
  var service = getService();
  service.reset();
}

/**
 * Configures the service.
 */
function getService() {
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
}

/**
 * Handles the OAuth callback.
 */
function authCallback(request) {
  var service = getService();
  var authorized = service.handleCallback(request);
  if (authorized) {
    return HtmlService.createHtmlOutput('Success!');
  } else {
    return HtmlService.createHtmlOutput('Denied');
  }
}
