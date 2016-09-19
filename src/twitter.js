//https://script.google.com/macros/d/1nA0fj4a8Fga-whToZEzeqOW0gwDvpSmhav66ZT1qUa37LvX6bLoSZTgW/usercallback

function TwitterClient(service, cfg) {
    this.cfg = cfg;
    this.propertyKey = cfg.consumerKey + '_latest_tweet_date';
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
    processRetweets: function() {
        if (this.service.hasAccess()) {
            var tweets = this.searchForTweets(this.cfg.retweetMonitoringSearch);
            for (var i = tweets.length - 1; i >= 0; i--) {
                try {
                    var tweet = tweets[i];
                    Logger.log("Found tweet from " + tweet.created_at + " with text: " + tweet.text);
                    this.retweet(tweet);
                } catch (error) {
                    Logger.log(error);
                }
            }
        } else {
            var authorizationUrl = this.service.authorize();
            Logger.log('Open the following URL and re-run the script: %s',
                authorizationUrl);
        }
    },
    pullCounts: function() {
        if (this.service.hasAccess()) {
            // TODO: refactor this to have a tweet callback handler in stead of cut and paste
            var tweets = this.searchForTweets(this.cfg.countsMonitoringSearch);
            for (var i = tweets.length - 1; i >= 0; i--) {
                var tweet = tweets[i];
                Logger.log("Found tweet from " + tweet.created_at + " with text: " + tweet.text);
                this.recordCount(tweet);
            }
        }
        var tags = getMatches(input.text, /(?:^|\s)(?:#)([a-zA-Z\d]+)/gm, 1);
        var numbers = getMatches(input.text, /\b([0-9]+)\b/g, 0);
    },

    recordCount: function(tweet) {},

    getMatches: function(inputText, regex, position) {
        var matches = [];
        var match;

        while ((match = regex.exec(inputText))) {
            matches.push(match[position]);
        }
        return matches;
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
        var cfg = config.twitter_config;
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
    },

    /**
     * Handles the OAuth callback.
     */
    authCallback: function(request) {
        var service = this.getService();
        var authorized = service.handleCallback(request);
        if (authorized) {
            return HtmlService.createHtmlOutput('Success!');
        } else {
            return HtmlService.createHtmlOutput('Denied');
        }
    }
};

function authCallback(request) {
    new TwitterService().authCallback(request);
}

function reset() {
    new TwitterService().reset();
}

function processRetweets() {
    var client = new TwitterClient(new TwitterService().getService(), config.twitter_config);
    client.processRetweets();
}

// this block is for when running in node outside of GAS
if (typeof exports !== 'undefined') {
    exports.TwitterService = TwitterService;
    exports.TwitterClient = TwitterClient;
}
