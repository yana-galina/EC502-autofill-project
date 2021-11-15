"use strict";
browser.runtime.onMessage.addListener(count);

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
browser.tabs.onUpdated.addListener((tabId, changed) => {
        browser.tabs.query({
            currentWindow: true,
            active: true
        }).then(sendMessageToTabs).catch(onError);
    }
)

function count(message) {
    browser.browserAction.setBadgeText({text: message.count.toString()});
}