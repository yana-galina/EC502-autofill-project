"use strict";
browser.runtime.onMessage.addListener(  function(request, sender, sendResponse) {
        console.log('bg.js: ', request);
        console.log('req has prop')
        if (request.pageSuspicious) {
            console.log("page suspicous")
            browser.browserAction.setBadgeText({text: "!"});
            browser.browserAction.setBadgeBackgroundColor({color: "red"});

        }
        else if(request.hasOwnProperty("count")) {
            console.log("page not suspicous");
            browser.browserAction.setBadgeText({text: request.count.toString()});
            browser.browserAction.setBadgeBackgroundColor({color: "blue"});

        }
    }
);


function onError(error) {
    console.error(`Error: ${error}`);
}

function sendMessageToTabs(tabs) {
    for (let tab of tabs) {
        browser.tabs.sendMessage(
            tab.id,
            {greeting: "run"}
        ).catch(onError);
    }
}
browser.tabs.onUpdated.addListener( (tabId, changed) => {
    browser.tabs.query({
            currentWindow: true,
            active: true
        }).then(sendMessageToTabs).catch(onError);
    }
)