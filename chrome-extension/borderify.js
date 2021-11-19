chrome.runtime.onMessage.addListener(run_func);
function run_func(message) {
    if(message.greeting === "run"){
        find_fields();
    }
    if(message.message === "start"){
       find_fields();

    }
}


function find_fields() {
    let input_list = [];
    let checked_list = [];
    let inputs = document.querySelectorAll("input")
    if (inputs.length > 0) {

        for (let input of inputs) {

            if (input.type !== "button" && input.type !== "submit") {
                // console.log(input.type)
                // checked_list.push(check(input));
                // check(input);
                input_list.push((input.name) ? input.name : input.value);
                input.style.border = "2px solid red";
            }
        }
        // browser.browserAction.setBadgeText({text: "1"});
        // alert(`There are ${inputs.length} input fields with these names: ${input_list}`);
        //
        console.log(inputs);
        // console.log(`There are ${inputs}`)
        chrome.runtime.sendMessage({"count": input_list.length, "fields": input_list, "checked": checked_list});

    }
}