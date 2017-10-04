/*jslint node: true */
"use strict";

var trello = {};

// Running in Node
if (typeof module !== 'undefined') {
  var services = require('./services');
  var config = require('./config');
  module.exports = trello;
}

trello.BASE_URL = 'https://api.trello.com/1/';

trello.getServiceArgs = function () {
  var cfg = config.getConfiguration().trello;
  return {
    service_name: 'trello',
    access_token_url: 'https://trello.com/1/OAuthGetAccessToken',
    authorization_url: 'https://trello.com/1/OAuthAuthorizeToken?expiration=' + cfg.expiration + "&scope=read,write",
    request_token_url: 'https://trello.com/1/OAuthGetRequestToken',
    consumer_key: cfg.consumerKey,
    consumer_secret: cfg.consumerSecret,
    callback_function: 'trelloAuthCallback'
  };
};

// big function... may need to break down further
trello.getNewsletterContent = function (callback) {
  var cfg = config.getConfiguration().trello,
    cfgLists = [cfg.newContentList, cfg.oldContentList, cfg.retiredContentList];
  trello.getBoards(function (err, boards) {
    var board = boards.filter(function (board, index) {
      return board.name === cfg.boardName;
    })[0];
    trello.getListsByBoardId(board.id, function (err, lists) {
      var foundLists = cfgLists.map(function (cfgListName, index) {
          return lists.filter(function (theList, index) {
            return theList.name === cfgListName;
          })[0];
        }),
        cardStack = foundLists.map(function (theList, index) {
          var theCards = [];
          trello.getCardsByListId(theList.id, function (err, cards) {
            theCards = cards;
          });
          return theCards;
        }),
        cardsToStack = cardStack.map(function (item, index) {
          return {
            listName: cfgLists[index],
            cards: item
          };
        });
      callback(err, cardsToStack);
    });
  });
};

trello.getBoards = function (callback) {
  services.webExec(
    trello.getServiceArgs(),
    trello.BASE_URL + 'members/me/boards?',
    {
      method: 'get'
    },
    function (err, result) {
      if (err) {
        services.showSideBar(err);
      } else {
        callback(err, JSON.parse(result));
      }
    }
  );
};

trello.getListsByBoardId = function (boardId, callback) {
  services.webExec(
    trello.getServiceArgs(),
    trello.BASE_URL + 'boards/' + boardId + '?lists=open&list_fields=name&fields=name,desc&',
    {
      method: 'get'
    },
    function (err, result) {
      if (err) {
        services.showSideBar(err);
      } else {
        callback(err, JSON.parse(result).lists);
      }
    }
  );
};

trello.getCardsByListId = function (listId, callback) {
  services.webExec(
    trello.getServiceArgs(),
    trello.BASE_URL + 'lists/' + listId + '/cards/',
    {
      method: 'get'
    },
    function (err, result) {
      if (err) {
        services.showSideBar(err);
      } else {
        callback(err, JSON.parse(result));
      }
    }
  );
};

trello.addCardToInbox = function (cardContent, callback) {
  var cfg = config.getConfiguration().trello;
  // hack to get token for url...
  trello.getBoards(function (err, boards) {
    var board = boards.filter(function (board, index) {
      return board.name === cfg.boardName;
    })[0];
    trello.getListsByBoardId(board.id, function (err, lists) {
      var inbox = lists.filter(function (theList, index) {
        return (theList.name = cfg.inboxList);
      })[0];
      services.webExec(
        trello.getServiceArgs(),
        trello.BASE_URL + 'cards?idList=' + inbox.id, //+ '&key=' + cfg.consumerKey + '&token=' + token.public,
        {
          method: 'post',
          payload: cardContent
        },
        function (err, result) {
          if (err) {
            services.showSideBar(err);
          } else {
            callback(err, JSON.parse(result));
          }
        }
      );
    });
  });
};
