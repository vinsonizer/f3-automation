function getNewsletterContent() {
  var cfg = getConfiguration().trello_config;
  var inboxListId = getTargetListId(cfg, cfg.inboxList);
  var newListId = getTargetListId(cfg, cfg.newContentList);
  var oldListId = getTargetListId(cfg, cfg.oldContentList);
  var retiredListId = getTargetListId(cfg, cfg.retiredContentList);
}

function getTargetListId(cfg, listName) {
    var boards = callTrelloApi("members/me/boards?", cfg.apiKey, cfg.token);
    var targetBoardId = (boards.filter(function(board, index) {
        return board.name == cfg.boardName;
    }))[0].id;
    var lists = callTrelloApi("boards/" + targetBoardId + "?lists=open&list_fields=name&fields=name,desc&", cfg.apiKey, cfg.token).lists;
    var list = (lists.filter(function(list, index) {
        return list.name == listName;
    }))[0];
    return list.id;
}

function callTrelloApi(apiCall, key, token) {
    var url = "https://api.trello.com/1/" + apiCall + "key=" + key + "&token=" + token;
    var resultJson = UrlFetchApp.fetch(url).getContentText();
    var data = JSON.parse(resultJson);
    return data;
}
