var TWITTER_BASE_URL = 'https://api.twitter.com/1.1/';

var twitter = {};

twitter.get_service = function(cfg) {
  return services.get_oauth_service({
    service_name: 'twitter',
    access_token_url: 'https://api.twitter.com/oauth/access_token',
    request_token_url: 'https://api.twitter.com/oauth/request_token',
    authorization_url: 'https://api.twitter.com/oauth/authorize',
    consumer_key: cfg.consumerKey,
    consumer_secret: cfg.consumerSecret,
    callback_function: 'twitterAuthCallback'
  });
};

twitter.search_for_tweets = function(searchString, opts) {
  // check since yesterday, no way to pass specific time
  var latestTweetDate = new Date();
  latestTweetDate.setDate(latestTweetDate.getDate() - 1);
  var sinceDate = latestTweetDate.getFullYear() + "-" + (latestTweetDate.getMonth() + 1) + "-" + latestTweetDate.getDate();
  var url = TWITTER_BASE_URL + '/search/tweets.json?q=' + encodeURIComponent(searchString + " since:" + sinceDate);
  opts.method = 'get';
  var response = services.fetch(url, twitter.get_service(cfg), opts);
  var tweets = services.parse_json(response).statuses;
  services.log("Found " + tweets.length + " for query with since date of " + sinceDate + " with opts " + opts);
  return tweets;
};

twitter.retweet = function(tweet) {
  var rt_url = TWITTER_BASE_URL + '/statuses/retweet/' + tweet.id_str + '.json';
  var rt_response = services.fetch(rt_url, twitter.get_service, {
    method: 'post'
  });
  return services.parse_json(rt_response);
};

twitter.get_tweet = function(id_string) {
  var tweet_url = 'https://api.twitter.com/1.1/statuses/show/' + id_string + '.json';
  var tweet_response = services.fetch(tweet_url, twitter.get_service, {
    method: 'get'
  });
  var resultTweet = services.parse_json(tweet_response);
  return resultTweet;
};

twitter.log_tweet = function(tweet, log_tweet_callback) {
  if (tweet.is_quote_status) {
    tweet = twitter.get_tweet(tweet.quoted_status_id_str);
  }
  var getMatches = function(inputText, regex, position) {
    var matches = [];
    var match;

    while ((match = regex.exec(inputText))) {
      matches.push(match[position]);
    }
    return matches;
  };
  var tags = getMatches(tweet.text, /(?:^|\s)(?:#)([a-zA-Z\d]+)/gm, 1);
  var numbers = getMatches(tweet.text, /\b([0-9]+)\b/g, 0);
  var tweetId = tweet.id_str;
  log_tweet_callback([
    tweetId, tweet.user.screen_name, tweet.created_at, numbers.toString(), tags.toString(), tweet.text
  ]);
};

twitter.tweet_handler = function(search_string, callback, additional_args) {
  var handleTweets = function(tweets, callback, additional_args) {
    for (var i = tweets.length - 1; i >= 0; i--) {
      try {
        var tweet = tweets[i];
        Logger.log("Found tweet from " + tweet.created_at + " with text: " + tweet.text);
        callback(tweet, additional_args);
      } catch (error) {
        Logger.log(error);
      }
    }
  };

  if (twitter.get_service().hasAccess()) {
    var tweets = twitter.search_for_tweets(search_string);
    handleTweets(tweets, callback, additional_args);
  } else {
    services.show_auth_dialog(twitter.get_service().authorize());
  }
};

twitter.retweet_search_tweets = function(cfg) {
  twitter.tweet_handler(cfg.retweetMonitoringSearch, twitter.retweet);
};

twitter.log_search_tweets = function(cfg, sheet_log_callback) {
  twitter.tweet_handler(cfg.countsMonitoringSearch, twitter.log_tweet, sheet_log_callback);
};

// this block is for when running in node outside of GAS
if (typeof exports !== 'undefined') {
  exports.twitter = twitter;
}
