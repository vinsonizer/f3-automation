function doGet(e) {
  var params = JSON.stringify(e);
  return HtmlService.createHtmlOutput(getNewsletterContent());
}

function getNewsletterContent() {
    var cfg = getConfiguration().trello_config;
    var newListContent = getListContent(cfg.newContentList);
    var oldListContent = getListContent(cfg.oldContentList);
    var retiredListContent = getListContent(cfg.retiredContentList);
    return newListContent + oldListContent + retiredListContent;
}

function getListContent(listName) {
    var listId = getTargetListId(listName);
    var cards = callTrelloApi("/lists/" + listId + "/cards/?");
    var concatCards = function(fullContent, card) {
      return fullContent + card.desc + "\n---\n";
    };
    var content = cards.reduce(concatCards, "# " + listName + "\n---\n");
    return micromarkdown.parse(content);
}

function getTargetListId(listName) {
    var cfg = getConfiguration().trello_config;
    var boards = callTrelloApi("members/me/boards?");
    var targetBoardId = (boards.filter(function(board, index) {
        return board.name == cfg.boardName;
    }))[0].id;
    var lists = callTrelloApi("boards/" + targetBoardId + "?lists=open&list_fields=name&fields=name,desc&").lists;
    var list = (lists.filter(function(list, index) {
        return list.name == listName;
    }))[0];
    return list.id;
}

function callTrelloApi(apiCall) {
    var cfg = getConfiguration().trello_config;
    var url = "https://api.trello.com/1/" + apiCall + "key=" + cfg.apiKey + "&token=" + cfg.token;
    var resultJson = UrlFetchApp.fetch(url).getContentText();
    var data = JSON.parse(resultJson);
    return data;
}
