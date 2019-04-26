/* global describe, beforeEach, afterEach, it */
var assert = require('chai').assert
var sinon = require('sinon')
var fs = require('fs')

var config = require('../lib/config')
var twitter = require('../lib/twitter')
var services = require('../lib/services')

var testTweets = JSON.parse(fs.readFileSync('test/data/tweets.json', 'utf-8'))

describe('Twitter Client', function () {
  var sandbox
  var fetchStub
  beforeEach(function () {
    sandbox = sinon.createSandbox()
    fetchStub = sandbox.stub(services, 'fetch')
    sandbox.stub(config, 'getConfiguration').returns({
      twitter: {
        consumerKey: 'ABC',
        consumerSecret: '123'
      }
    })
    var fakeService = {
      hasAccess: function () {
        return true
      }
    }
    sandbox.stub(services, 'createOauthService').yields(null, fakeService)
  })

  afterEach(function () {
    sandbox.restore()
  })

  it('Should return tweets from a search', function (done) {
    fetchStub.onFirstCall().returns(JSON.stringify(testTweets.searchResults))

    twitter.searchForTweets('hi', function (err, tweets) {
      if (err) throw err
      else {
        assert.isArray(tweets, 'search should return an array')
        assert.equal(tweets.length, 4, 'Should have 4 tweets in search results')
      }
      done()
    })
  })

  it('Should fetch a single tweet by id', function (done) {
    var tweetId = '210462857140252672'
    fetchStub.onFirstCall().returns(JSON.stringify(testTweets.fetchResults))

    twitter.fetchTweet(tweetId, function (err, tweet) {
      if (err) throw err
      else {
        assert.equal(tweet.id_str, tweetId, 'fetched tweet should have requested id')
        assert.equal(tweet.user.name, 'Twitter API', 'tweet user name should be "Twitter API"')
      }
      done()
    })
  })

  it('Should retweet by id', function (done) {
    var tweetId = '241259202004267009'
    fetchStub.onFirstCall().returns(JSON.stringify(testTweets.retweetResult))

    twitter.retweet(tweetId, function (err, tweet) {
      if (err) throw err
      else {
        assert.notEqual(tweet.id_str, tweetId, 'should get a new tweet id')
        assert.equal(tweet.retweeted_status.id_str, tweetId, 'retweeted id should match original')
      }
      done()
    })
  })
})
