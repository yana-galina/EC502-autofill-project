chrome.tabs.query({currentWindow: true, active: true}, function (tabs){
    var activeTab = tabs[0];
    chrome.tabs.sendMessage(activeTab.id, {"message": "start"});
});


chrome.runtime.onMessage.addListener(function(message,sender,sendResponse){
    console.log('got msg ' + message);
    msg = JSON.stringify(message.count);
    document.querySelector("#counter").innerHTML = message.count.toString() + " Fields on Page";
    let table_body = "";

    var susCount = 0;
    message.fields.forEach((field, i) => {
        let el = null;
        if (field.isSuspicious && field.formSuspicious) {
          table_body +=  "<tr style='color: red;' id='row-" + i + "'><th scope=\"row\">"+ (i+1).toString() +"</th><th scope=\"row\">"+ (field.form_num+1).toString() +"</th><td>" + field.name + "</td></tr>";
          susCount += 1;
        }
        else {
          table_body +=  "<tr id='row-" + i + "'><th scope=\"row\">"+ (i+1).toString() +"</th><td>"+ (field.form_num+1).toString() +"</th><td>" + field.name + "</td></tr>";
        }

    });

    document.querySelector("#table_body").innerHTML = table_body;

    if (susCount > 0) {

        document.getElementById("problem-inputs").innerHTML = `<h1>${susCount} suspicious fields on page</h1>`;
    }
    console.log(message.fields);
    console.log("suscount", susCount);

});