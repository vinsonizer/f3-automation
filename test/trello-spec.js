var assert = require("chai").assert;
var sinon = require("sinon");
var fs = require('fs');

var trello = require("../lib/trello");
var services = require("../lib/services");
var config = require("../lib/config");

var testTrello = JSON.parse(fs.readFileSync('test/data/trello.json', 'utf-8'));


describe('Trello Client', function() {
  var sandbox;
  var fetchStub;
  beforeEach(function() {
    sandbox = sinon.sandbox.create();
    fetchStub = sandbox.stub(services, 'fetch');
    configStub = sandbox.stub(config, 'getConfiguration').returns({
      trello: {
        boardName: "Example Board",
        newContentList: "To Do Soon",
        oldContentList: "Doing",
        retiredContentList: "Done",
        consumerKey: "ABC",
        consumerSecret: "123"
      }
    });
    var fakeService = {
      hasAccess: function() {
        return true;
      }
    };
    sandbox.stub(services, 'createOauthService').yields(null, fakeService);
  });

  afterEach(function() {
    sandbox.restore();
  });

  it('Should return all available boards', function(done) {
    fetchStub.onFirstCall().returns(JSON.stringify(testTrello.getBoards));

    trello.getBoards(function(err, boards) {
      assert.equal(boards.length, 2, "should have 2 boards");
      done();
    });
  });

  it('Should return lists by board id', function(done) {
    fetchStub.onFirstCall().returns(JSON.stringify(testTrello.getListsByBoardId));
    var boardId = '4eea4ffc91e31d1746000046';

    trello.getListsByBoardId(boardId, function(err, lists) {
      assert.equal(lists.length, 3, "should have 3 lists");
      done();
    });
  });

  it('Should return cards by list id', function(done) {
    fetchStub.onFirstCall().returns(JSON.stringify(testTrello.getCardsByListId));
    var listId = '4eea503791e31d1746000080';

    trello.getCardsByListId(listId, function(err, cards) {
      assert.equal(cards.length, 1, "should have 1 card");
      done();
    });
  });

  it('Should pull newsletter cards when all have cards', function(done) {
    // pull boards
    fetchStub.onCall(0).returns(JSON.stringify(testTrello.getBoards));
    // get the lists for the board id
    fetchStub.onCall(1).returns(JSON.stringify(testTrello.getListsByBoardId));
    // get the cards for each of the three configured lists
    var testListId1 = "testListId1";
    var testListId2 = "testListId2";
    var testListId3 = "testListId3";
    var cardList = testTrello.getCardsByListId;
    cardList[0].id = testListId1;
    fetchStub.onCall(2).returns(JSON.stringify(cardList));
    cardList[0].id = testListId2;
    fetchStub.onCall(3).returns(JSON.stringify(cardList));
    cardList[0].id = testListId3;
    fetchStub.onCall(4).returns(JSON.stringify(cardList));

    var cfg = config.getConfiguration().trello;

    trello.getNewsletterContent(function(err, content) {
      assert.equal(content.length, 3, "should have 3 lists of cards");
      assert.equal(content[0].listName, cfg.newContentList, "first card list should match first list name");
      assert.equal(content[1].listName, cfg.oldContentList, "second card list should match second list name");
      assert.equal(content[2].listName, cfg.retiredContentList, "third card list should match third list name");
      assert.equal(content[0].cards[0].id, testListId1, "first card list should match first list id");
      assert.equal(content[1].cards[0].id, testListId2, "second card list should match second list id");
      assert.equal(content[2].cards[0].id, testListId3, "third card list should match third list id");
      done();
    });
  });

  it('Should handle when lists have no cards', function(done) {
    // pull boards
    fetchStub.onCall(0).returns(JSON.stringify(testTrello.getBoards));
    // get the lists for the board id
    fetchStub.onCall(1).returns(JSON.stringify(testTrello.getListsByBoardId));
    // get the cards for each of the three configured lists
    var testListId1 = "testListId1";
    var testListId2 = "testListId2";
    var testListId3 = "testListId3";
    var cardList = testTrello.getCardsByListId;
    cardList[0].id = testListId1;
    fetchStub.onCall(2).returns(JSON.stringify(cardList));
    cardList[0].id = testListId2;
    fetchStub.onCall(3).returns("[]");
    cardList[0].id = testListId3;
    fetchStub.onCall(4).returns(JSON.stringify(cardList));

    var cfg = config.getConfiguration().trello;

    trello.getNewsletterContent(function(err, content) {
      assert.equal(content.length, 3, "should have 3 lists of cards");
      assert.equal(content[0].cards[0].id, testListId1, "first card list should match first list id");
      assert.isArray(content[1].cards, "second card list should be array");
      assert.lengthOf(content[1].cards, 0, "second card list should be empty");
      assert.equal(content[2].cards[0].id, testListId3, "third card list should match third list id");
      done();
    });
  });


});
