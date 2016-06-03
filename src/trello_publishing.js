function test() {
  var newsletter = getNewsletterContent();
  //debugger;
}

function getNewsletterContent() {
  var cfg = getConfiguration().trello_config;
  //var inboxListId = getTargetListId(cfg, cfg.inboxList);
  // TODO: figure out a better way to do this instead of so may references to cfg
  var newListContent     = getListContent(getTargetListId(cfg.newContentList, cfg), "Hot this Week", cfg);
  var oldListContent     = getListContent(getTargetListId(cfg.oldContentList, cfg), "Still Fresh", cfg);
  var retiredListContent = getListContent(getTargetListId(cfg.retiredContentList, cfg), "Retired", cfg);
  return newListContent + oldListContent + retiredListContent;
}

function getListContent(listId, title, cfg) {
  var cards = callTrelloApi("/lists/" + listId + "/cards/?", cfg);
  var content = cards.reduce(concatCards, title + "\n\n");
  return micromarkdown.parse(content);
}

function concatCards(fullContent, card) {
  return fullContent + card.desc + "\n\n-----";
}

function getTargetListId(listName, cfg) {
    var boards = callTrelloApi("members/me/boards?", cfg);
    var targetBoardId = (boards.filter(function(board, index) {
        return board.name == cfg.boardName;
    }))[0].id;
    var lists = callTrelloApi("boards/" + targetBoardId + "?lists=open&list_fields=name&fields=name,desc&", cfg).lists;
    var list = (lists.filter(function(list, index) {
        return list.name == listName;
    }))[0];
    return list.id;
}

function callTrelloApi(apiCall, cfg) {
    var url = "https://api.trello.com/1/" + apiCall + "key=" + cfg.apiKey + "&token=" + cfg.token;
    var resultJson = UrlFetchApp.fetch(url).getContentText();
    var data = JSON.parse(resultJson);
    return data;
}
