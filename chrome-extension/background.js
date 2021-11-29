// background.js
chrome.runtime.onMessage.addListener(
  function(request, sender, sendResponse) {
  	console.log('bg.js: ', request);
    console.log('req has prop')
    if (request.pageSuspicious) {
      console.log("page suspicous")
        chrome.action.setBadgeText({text: "!"});
        chrome.action.setBadgeBackgroundColor({color: "red"});

    }
  	else if(request.hasOwnProperty("count")) {
        console.log("page not suspicous");
        chrome.action.setBadgeText({text: request.count.toString()});
        chrome.action.setBadgeBackgroundColor({color: "blue"});

    }
  }
);



async function sendMessageToTabs(tabs) {
    for (let tab of tabs) {
      try {
        console.log("sending run msg to tabs");
        chrome.tabs.sendMessage(
            tab.id,
            {greeting: "run"}
        );

      }
      catch (error) {
        console.error(error);
      }
    	
    }
}


chrome.tabs.onUpdated.addListener(async (tabId, changeInfo) => {
	try{
	  console.log("tab onupdate")
    let queryOptions = { active: true, currentWindow: true };
    let ts = await chrome.tabs.query(queryOptions);
    console.log("update tab: " + ts);
    sendMessageToTabs(ts);
  } catch (error) {
    console.error("got an error");

    console.error("My error:" + error);

  }

});



chrome.tabs.onActivated.addListener(async (tabId, changeInfo) => {
  try{
    console.log("tab onactivated")
    let queryOptions = { active: true, currentWindow: true };
    let ts = await chrome.tabs.query(queryOptions);
    console.log("activate tab: " + ts);
    sendMessageToTabs(ts);
  } catch (error) {
    console.error("got an error");

    console.error("My error:" + error);

  }

});
