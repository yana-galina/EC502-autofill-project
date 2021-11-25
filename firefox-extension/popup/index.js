browser.tabs.query({currentWindow: true, active: true}, function (tabs){
    var activeTab = tabs[0];
    browser.tabs.sendMessage(activeTab.id, {"message": "start"});
});
browser.runtime.onMessage.addListener(function(message,sender,sendResponse){
    msg = JSON.stringify(message.count);
    document.querySelector("#counter").innerHTML = message.count.toString() + " Fields on Page";
    let table_body = "";
    message.fields.forEach((field, i) => {
        let el = null;
        if (field.isSuspicious) {
            table_body +=  "<tr style='color: red;' id='row-" + i + "'><th scope=\"row\">"+ (i+1).toString() +"</th><td>" + field.name + "</td></tr>";
        }
        else {
            table_body +=  "<tr id='row-" + i + "'><th scope=\"row\">"+ (i+1).toString() +"</th><td>" + field.name + "</td></tr>";
        }
    });

    document.querySelector("#table_body").innerHTML = table_body;

});