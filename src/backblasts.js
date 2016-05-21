var config = {
  url: "http://f3nation.com/locations/fort-mill-sc/feed/",
  fileId: "1B5l_olGDsHI8fL_kzR9h4V5lFrJysB3a6xvU7sct7lk",
  sheetName: "BB Counts"
};

/*
Most of this code was contributed by Wingman (Trent Jones)
*/
function myFunction() {
    var url = config.url;
    main(url);
}

/* Credit: https://gist.github.com/agektmr */
function main(url) {

  var ss = getSheet();

  var property = PropertiesService.getScriptProperties();
  var last_update = property.getProperty('last_update');
  last_update = last_update === null ? 0 : parseFloat(last_update);

  var feed = UrlFetchApp.fetch(url).getContentText();
  var items = getItems(feed);
  var i = items.length - 1;
  var date = new Date();
  while (i > -1) {
    var item = items[i--];
    date = new Date(item.getChildText('pubDate'));
    if (date.getTime() > last_update) {
      insertRow(item, ss);
    }
  }
  property.setProperty('last_update', date.getTime());
}

function getSheet() {
  var file = SpreadsheetApp.openById(config.fileId);
  var sheet = file.getSheetByName(config.sheetName);
  return sheet;
}

function getItems(feed) {
  var doc = XmlService.parse(feed);
  var root = doc.getRootElement();
  var channel = root.getChild('channel');
  var items = channel.getChildren('item');
  return items;
}

function insertRow(item, sheet) {
  var title = item.getChildText('title');
  var url = item.getChildText('link');
  var author = item.getChildText('author');


  var additional = getAdditionalData(item);
  var date = new Date(item.getChildText('pubDate'));
  sheet.insertRowBefore(2);
  sheet.getRange('A2:D2').setValues([[additional.date, additional.category, additional.pax, url]]);
}

function getAdditionalData(item) {
  var url = item.getChildText('link');
  var body = UrlFetchApp.fetch(url).getContentText();

  var paxRegex = /The PAX:<\/strong>([^<]*)<\/li>/;
	  var whenRegex = /When:<\/strong>([^<]*)<\/li>/;
    var pax = 0;
    var when = "";
    var paxMatch = paxRegex.exec(body);
  var whenMatch = whenRegex.exec(body) && whenRegex.exec(body).length > 0 ?  whenRegex.exec(body)[1].trim():'';
    if (paxMatch){
      pax = paxMatch[0].split(",").length;
    }
    if(whenMatch) {
      when = whenMatch;
    }

  var cats = item.getChildren('category');

  var c = "";
  for (var i=0;i<cats.length;i++){
    c = cats[i].getText();
  }

  return {
    date: when,
    pax: pax,
    category: c
  };
}
