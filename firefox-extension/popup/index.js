browser.tabs.query({currentWindow: true, active: true}, function (tabs){
    var activeTab = tabs[0];
    browser.tabs.sendMessage(activeTab.id, {"message": "start"});
});
browser.runtime.onMessage.addListener(function(message,sender,sendResponse){
    msg = JSON.stringify(message.count);
    document.querySelector("#counter").innerHTML = message.count.toString() + " Fields on Page";
    message.fields.forEach(function (field, i) {
        document.querySelector("#table_body").innerHTML += "<tr id='" + i + "'><th scope=\"row\">"+ i +"</th><td>" + field + "</td></tr>";
        console.log(field);
    });

    console.log(message.fields);

});