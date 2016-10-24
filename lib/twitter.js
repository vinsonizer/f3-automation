var twitter = {};

// Running in Node
if (module) {
  var services = require('./services');
  var config = require('./config');
  module.exports = twitter;
}

twitter.BASE_URL = 'https://api.twitter.com/1.1/';

twitter.getServiceArgs = function() {
  var cfg = config.getConfiguration().twitter;
  return {
    service_name: 'twitter',
    access_token_url: 'https://api.twitter.com/oauth/access_token',
    request_token_url: 'https://api.twitter.com/oauth/request_token',
    authorization_url: 'https://api.twitter.com/oauth/authorize',
    consumer_key: cfg.consumerKey,
    consumer_secret: cfg.consumerSecret,
    callback_function: 'twitterAuthCallback'
  };
};

twitter.searchForTweets = function(searchString, callback) {
  services.webExec(
    twitter.getServiceArgs(),
    twitter.BASE_URL + '/search/tweets.json?q=' + encodeURIComponent(searchString), {
      method: 'get'
    },
    function(err, result) {
      callback(err, JSON.parse(result).statuses);
    });
};

twitter.fetchTweet = function(tweetId, callback) {
  services.webExec(
    twitter.getServiceArgs(),
    twitter.BASE_URL + '/statuses/show/' + tweetId + '.json', {
      method: 'get'
    },
    function(err, result) {
      callback(err, JSON.parse(result));
    });

};

twitter.retweet = function(tweetId, callback) {
  services.webExec(
    twitter.getServiceArgs(),
    twitter.BASE_URL + '/statuses/retweet/' + tweetId + '.json', {
      method: 'post'
    },
    function(err, result) {
      callback(err, JSON.parse(result));
    });
};
