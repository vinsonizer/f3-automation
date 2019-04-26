var twitter = {}

// Running in Node
if (typeof module !== 'undefined') {
  var services = require('./services')
  var config = require('./config')
  module.exports = twitter
}

twitter.BASE_URL = 'https://api.twitter.com/1.1/'

twitter.getServiceArgs = function () {
  var cfg = config.getConfiguration().twitter
  return {
    service_name: 'twitter',
    access_token_url: 'https://api.twitter.com/oauth/access_token',
    request_token_url: 'https://api.twitter.com/oauth/request_token',
    authorization_url: 'https://api.twitter.com/oauth/authorize',
    consumer_key: cfg.consumerKey,
    consumer_secret: cfg.consumerSecret,
    callback_function: 'twitterAuthCallback'
  }
}

function doTwitter (url, method, handler, callback) {
  services.webExec(
    twitter.getServiceArgs(),
    url, { method: 'get' },
    function (err, result) {
      if (err) callback(err)
      else callback(err, handler(result))
    })
}

twitter.searchForTweets = function (searchString, callback) {
  if (searchString) {
    doTwitter(
      twitter.BASE_URL + '/search/tweets.json?q=' + encodeURIComponent(searchString),
      'get', function (result) { return JSON.parse(result).statuses },
      callback
    )
  }
}

twitter.fetchTweet = function (tweetId, callback) {
  doTwitter(
    twitter.BASE_URL + '/statuses/show/' + tweetId + '.json',
    'get', function (result) { return JSON.parse(result) },
    callback
  )
}

twitter.retweet = function (tweetId, callback) {
  doTwitter(
    twitter.BASE_URL + '/statuses/retweet/' + tweetId + '.json',
    'post', function (result) { return JSON.parse(result) },
    callback
  )
}
