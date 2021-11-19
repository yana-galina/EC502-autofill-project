// background.js



let color = '#3aa757';

chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.sync.set({ color });
  console.log('Default background color set to %cgreen', `color: ${color}`);
});



chrome.runtime.onMessage.addListener(
  function(request, sender, sendResponse) {
  	console.log(request);
  	if(request.count) {
        chrome.action.setBadgeText({text: request.count.toString()});
    }
  }
);



// function onError(error) {
//     console.error(`Error: ${error}`);
// }

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
    console.log("activate tab: " + ts);
    sendMessageToTabs(ts);
  } catch (error) {
    console.error("got an error");

    console.error("My error:" + error);

  }

});

