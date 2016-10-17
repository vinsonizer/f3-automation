var assert = require("chai").assert;
var sinon = require("sinon");
var twitter = require("../src/twitter.js").twitter;

// Global Scope = :(
services = require("../src/services.js").services;
services.log = function(msg) {
  console.log(msg);
};

cfg = {};
cfg.consumerKey = 'abc';
cfg.consumerSecret = '123';

describe('Twitter Service', function() {
  var mock_service = {
    hasAccess: sinon.stub(),
    authorize: sinon.stub(),
    fetch: sinon.stub()
  };
  sinon.stub(services, 'show_auth_dialog');
  sinon.stub(services, 'get_oauth_service').returns(mock_service);

  describe('retweet_search_tweets', function() {
    it('should retweet', function() {
      twitter.retweet_search_tweets(cfg, function(args) {});
    });
  });

  describe('log_search_tweets', function() {
    mock_service.hasAccess.returns(true);
    mock_service.fetch.returns("<xml>test</xml>");
    var tweet_date = new Date();
    var tweet_text = "A record 92 PAX at #LacesOut for Yassos @F3TheFort #TheFortCounts";
    var parse_json_stub = sinon.stub(services, 'parse_json');
    parse_json_stub.returns({
      statuses: [{
        id_str: "12345",
        text: tweet_text,
        created_at: tweet_date,
        user: {
          screen_name: "vinsonizer"
        }
      }]
    });
    it('should log tweets', function() {
      twitter.log_search_tweets(cfg, function(rowValues) {
        //tweetId, tweet.user.screen_name, tweet.created_at, numbers.toString(), tags.toString(), tweet.text
        assert.equal(rowValues[0], '12345', "Tweet Id should match");
        assert.equal(rowValues[1], 'vinsonizer', "Tweet user.screen_name should match");
        assert.equal(rowValues[2], tweet_date, "Tweet Date should match");
        assert.equal(rowValues[3], 92, "Parsed numbers should match");
        assert.equal(rowValues[4], ["LacesOut", "TheFortCounts"], "Tweet tags should match");
        assert.equal(rowValues[5], tweet_text, "Tweet Id should match");
      });
      parse_json_stub.reset();
    });
  });
});
