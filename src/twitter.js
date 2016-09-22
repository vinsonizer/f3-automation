//https://script.google.com/macros/d/1nA0fj4a8Fga-whToZEzeqOW0gwDvpSmhav66ZT1qUa37LvX6bLoSZTgW/usercallback

function twitterAuthCallback(request) {
    new TwitterService().twitterAuthCallback(request);
}

function twitterResetAuth() {
    new TwitterService().reset();
}

function twitterProcessRetweets() {
    var client = new TwitterClient(new TwitterService().getService(), getConfig());
    client.processRetweets();
}

function twitterCountsPolling() {
    var client = new TwitterClient(new TwitterService().getService(), getConfig());
    client.pullCounts();
}

function TwitterClient(service, cfg) {
    this.cfg = cfg.twitter_config;
    this.service = service;
}

TwitterClient.prototype = {
    constructor: TwitterClient,

    searchForTweets: function(searchString) {
        // check since yesterday, no way to pass specific time
        var latestTweetDate = new Date();
        latestTweetDate.setDate(latestTweetDate.getDate() - 1);
        var sinceDate = latestTweetDate.getFullYear() + "-" + (latestTweetDate.getMonth() + 1) + "-" + latestTweetDate.getDate();
        var url = 'https://api.twitter.com/1.1/search/tweets.json?q=' + encodeURIComponent(searchString + " since:" + sinceDate);
        var response = this.service.fetch(url, {
            method: 'get'
        });
        var tweets = JSON.parse(response.getContentText()).statuses;
        Logger.log("Found " + tweets.length + " for query with since date of " + sinceDate);
        return tweets;
    },

    retweet: function(tweet) {
        var rt_url = 'https://api.twitter.com/1.1/statuses/retweet/' + tweet.id_str + '.json';
        var rt_response = this.service.fetch(rt_url, {
            method: 'post'
        });
        var rt_result = JSON.parse(rt_response.getContentText());
    },

    getTweet: function(idString) {
      var tweet_url = 'https://api.twitter.com/1.1/statuses/show/' + idString + '.json';
      var tweet_response = this.service.fetch(tweet_url, {
          method: 'get'
      });
      var resultTweet = JSON.parse(tweet_response.getContentText());
      return resultTweet;
    },

    handleTweets: function(tweets, binding, callback) {
        for (var i = tweets.length - 1; i >= 0; i--) {
            try {
                var tweet = tweets[i];
                Logger.log("Found tweet from " + tweet.created_at + " with text: " + tweet.text);
                callback(tweet, binding);
            } catch (error) {
                Logger.log(error);
            }
        }
    },

    processRetweets: function() {
      if(this.cfg.retweetMonitoringSearch) {
        if (this.service.hasAccess()) {
            var tweets = this.searchForTweets(this.cfg.retweetMonitoringSearch);
            this.handleTweets(tweets, this, this.retweet);
        } else {
          _showAuthDialog(this.service.authorize());
        }
      }
    },

    pullCounts: function() {
      if(this.cfg.countsMonitoringSearch) {
        // TODO: Dry this
        if (this.service.hasAccess()) {
            var tweets = this.searchForTweets(this.cfg.countsMonitoringSearch);
            this.handleTweets(tweets, this, this.logTweet);
        } else {
          _showAuthDialog(this.service.authorize());
        }
      }
    },

    logTweet: function(tweet, binding) {
        var self = binding;
        if(tweet.is_quote_status) {
          tweet = self.getTweet(tweet.quoted_status_id_str);
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

        var file = SpreadsheetApp.getActiveSpreadsheet();
        var sheet = file.getSheetByName(self.cfg.tweetCountSheetName);

        var rangeValues = sheet.getRange("A2:A52");
        // check last 50
        var idRange = Array.apply(null, Array(50)).map(function(_, i) {
            return rangeValues.getCell(i + 1, 1).getValue();
        });

        if (idRange.indexOf(tweetId) === -1) {
            sheet.insertRowBefore(2);
            sheet.getRange('A2:F2').setValues([
                [
                    tweetId, tweet.user.screen_name, tweet.created_at, numbers.toString(), tags.toString(), tweet.text
                ]
            ]);
        }
    }
};

function TwitterService() {}

// encapsulation for testing
TwitterService.prototype = {
    constructor: TwitterService,
    /**
     * Reset the authorization state, so that it can be re-tested.
     */
    reset: function() {
        var service = this.getService();
        service.reset();
    },

    /**
     * Configures the service.
     */
    getService: function() {
        var cfg = getConfig().twitter_config;
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
            .setCallbackFunction('twitterAuthCallback')
            // Set the property store where authorized tokens should be persisted.
            .setPropertyStore(PropertiesService.getUserProperties());
    },

    /**
     * Handles the OAuth callback.
     */
    twitterAuthCallback: function(request) {
        var service = this.getService();
        var authorized = service.handleCallback(request);
        if (authorized) {
            return HtmlService.createHtmlOutput('Success!');
        } else {
            return HtmlService.createHtmlOutput('Denied');
        }
    }
};



// this block is for when running in node outside of GAS
if (typeof exports !== 'undefined') {
    exports.TwitterService = TwitterService;
    exports.TwitterClient = TwitterClient;
}
