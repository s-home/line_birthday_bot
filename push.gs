var access_token = "LINE Developersに書いてあるChannel Access Token"

function setTrigger() {
  var triggerDay = new Date();
  triggerDay.setHours(23);
  triggerDay.setMinutes(59);
  ScriptApp.newTrigger("createMessage").timeBased().at(triggerDay).create();
}

function deleteTrigger() {
  var triggers = ScriptApp.getProjectTriggers();
  for(var i=0; i < triggers.length; i++) {
    if (triggers[i].getHandlerFunction() == "createMessage") {
      ScriptApp.deleteTrigger(triggers[i]);
    }
  }
}

function doPost(e){
  var event = JSON.parse(e.postData.contents).events[0];
  var user_id = event.source.userId
  var eventType = event.type
  var nickname = getUserProfile(user_id);
  if(eventType == "follow") {
    var data = SpreadsheetApp.openById("スプシのID").getSheetByName('user_id');
    var last_row = data.getLastRow();
    for(var i = last_row; i >= 1; i--) {
      if(data.getRange(i,1).getValue() != '') {
        var j = i + 1;
        data.getRange(j,1).setValue(nickname);
        data.getRange(j,2).setValue(user_id);
        data.getDataRange().removeDuplicates([2])
        break;
      }
    }
  }
}

function getUserProfile(user_id){ 
  var url = 'https://api.line.me/v2/bot/profile/' + user_id;
  var userProfile = UrlFetchApp.fetch(url,{
    'headers': {
      'Authorization' :  'Bearer ' + access_token,
    },
  })
  return JSON.parse(userProfile).displayName;
}

//送信するメッセージ定義する関数を作成します。
function createMessage() {
  deleteTrigger();
  Utilities.sleep(61000);
  var now = new Date();  
  var now = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  var nowDate = Utilities.formatDate(now,'Asia/Tokyo','MM/dd');

  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('birthday');
  var data = sheet.getDataRange().getValues();
  var LastRow = sheet.getLastRow();
  for (var i = 1; i < LastRow; i++) {
    if (i > LastRow) {
      break;
    }
    
    var user_name = data[i][0];
    var user_birthday = data[i][1];
    var user_birthday = Utilities.formatDate(user_birthday,'Asia/Tokyo','MM/dd');

    if(nowDate == user_birthday){
      var message = nowDate + 'は、' + user_name + 'さんの誕生日です！！ \n \nお祝いのメッセージを送ってあげましょう！'
      push(message)
    }
  }
}


//実際にメッセージを送信する関数を作成します。
function push(text) {
//メッセージを送信(push)する時に必要なurlでこれは、皆同じなので、修正する必要ありません。
//この関数は全て基本コピペで大丈夫です。
  var url = "https://api.line.me/v2/bot/message/push";
  var headers = {
    "Content-Type" : "application/json; charset=UTF-8",
    'Authorization': 'Bearer ' + access_token,
  };


  //textの部分は、送信されるメッセージが入ります。createMessageという関数で定義したメッセージがここに入ります。
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('user_id');
  var data = sheet.getDataRange().getValues();
  var LastRow = sheet.getLastRow();
  for (var i = 1; i < LastRow; i++) {
    var user = data[i][1]
    var postData = {
      "to" : user,
      "messages" : [
        {
          'type':'text',
          'text':text,
        }
      ]
    };
    
    var options = {
      "method" : "post",
      "headers" : headers,
      "payload" : JSON.stringify(postData)
    };
    
    UrlFetchApp.fetch(url, options);
  };
};