chrome.tabs.query({currentWindow: true, active: true}, function (tabs){
    var activeTab = tabs[0];
    chrome.tabs.sendMessage(activeTab.id, {"message": "start"});
});


chrome.runtime.onMessage.addListener(function(message,sender,sendResponse){
    console.log('got msg ' + message);
    msg = JSON.stringify(message.count);
    document.querySelector("#counter").innerHTML = message.count.toString() + " Fields on Page";
    message.fields.forEach((field, i) => {
        let el = null;
        if (field.isSuspicious) {
          el =  "<tr style='color: red;' id='" + i + "'><th scope=\"row\">"+ i +"</th><td>" + field.name + "</td></tr>";
          document.querySelector("#table_body").innerHTML += el;
        }
        else {
          el =  "<tr id='" + i + "'><th scope=\"row\">"+ i +"</th><td>" + field.name + "</td></tr>";
          document.querySelector("#table_body").innerHTML += el;

        }
    });

    console.log(message.fields);

});