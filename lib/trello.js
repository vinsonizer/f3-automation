/* jslint node: true */
'use strict'

var trello = {}

// Running in Node
if (typeof module !== 'undefined') {
  var services = require('./services')
  var config = require('./config')
  module.exports = trello
}

trello.BASE_URL = 'https://api.trello.com/1/'

trello.getServiceArgs = function () {
  var cfg = config.getConfiguration().trello
  return {
    service_name: 'trello',
    access_token_url: 'https://trello.com/1/OAuthGetAccessToken',
    authorization_url: 'https://trello.com/1/OAuthAuthorizeToken?expiration=' + cfg.expiration + '&scope=read,write',
    request_token_url: 'https://trello.com/1/OAuthGetRequestToken',
    consumer_key: cfg.consumerKey,
    consumer_secret: cfg.consumerSecret,
    callback_function: 'trelloAuthCallback'
  }
}

function boardFilter (cfg, boards) {
  return boards.filter(function (board, index) {
    return board.name === cfg.boardName
  })[0]
}

// big function... may need to break down further
trello.getNewsletterContent = function (callback) {
  var cfg = config.getConfiguration().trello
  var cfgLists = [cfg.newContentList, cfg.oldContentList, cfg.retiredContentList]
  trello.getBoards(function (err, boards) {
    if (err) callback(err)
    else {
      var board = boardFilter(cfg, boards)
      trello.getListsByBoardId(board.id, function (err, lists) {
        var foundLists = cfgLists.map(function (cfgListName, index) {
          return lists.filter(function (theList, index) {
            return theList.name === cfgListName
          })[0]
        })
        var cardStack = foundLists.map(function (theList, index) {
          var theCards = []
          trello.getCardsByListId(theList.id, function (err, cards) {
            if (err) callback(err)
            else theCards = cards
          })
          return theCards
        })
        var cardsToStack = cardStack.map(function (item, index) {
          return {
            listName: cfgLists[index],
            cards: item
          }
        })
        callback(err, cardsToStack)
      })
    }
  })
}

function getTrello (url, handler, callback) {
  services.webExec(
    trello.getServiceArgs(),
    url, { method: 'get' },
    function (err, result) {
      if (err) services.showSideBar(err)
      else callback(err, handler(result))
    }
  )
}

trello.getBoards = function (callback) {
  getTrello(
    trello.BASE_URL + 'members/me/boards?',
    function (result) { return JSON.parse(result) },
    callback)
}

trello.getListsByBoardId = function (boardId, callback) {
  getTrello(
    trello.BASE_URL + 'boards/' + boardId + '?lists=open&list_fields=name&fields=name,desc&',
    function (result) { return JSON.parse(result).lists },
    callback)
}

trello.getCardsByListId = function (listId, callback) {
  getTrello(
    trello.BASE_URL + 'lists/' + listId + '/cards/',
    function (result) { return JSON.parse(result) },
    callback)
}

trello.addCardToInbox = function (cardContent, callback) {
  var cfg = config.getConfiguration().trello
  trello.getBoards(function (err, boards) {
    if (err) callback(err)
    else {
      var board = boards.filter(function (board, index) {
        return board.name === cfg.boardName
      })[0]
      trello.getListsByBoardId(board.id, function (err, lists) {
        if (err) callback(err)
        else {
          var inbox = lists.filter(function (theList, index) {
            return (theList.name = cfg.inboxList)
          })[0]
          services.webExec(
            trello.getServiceArgs(),
            trello.BASE_URL + 'cards?idList=' + inbox.id, { method: 'post', payload: cardContent },
            function (err, result) {
              if (err) services.showSideBar(err)
              else callback(err, JSON.parse(result))
            }
          )
        }
      })
    }
  })
}
