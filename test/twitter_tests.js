var assert = require("chai").assert;
var sinon = require("sinon");
var twitter = require("../src/twitter.js").twitter;

// Global Scope = :(
services = require("../src/services.js").services;

describe('Twitter Service', function() {
  var cfg = {
    consumerKey: 'abc',
    consumerSecret: '123'
  };
  describe('retweet_search_tweets', function() {
    it('should retweet', function() {
      twitter.retweet_search_tweets(cfg);
    });
  });

  describe('log_search_tweets', function() {
    it('should log tweets', function() {
      twitter.log_search_tweets(cfg, function(rowValues) {

      });
    });
  });
});
