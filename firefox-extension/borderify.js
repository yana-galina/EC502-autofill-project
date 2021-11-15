browser.runtime.onMessage.addListener(find_fields);

function find_fields() {
    let input_list = [];
    let inputs = document.getElementsByTagName("input")
    if (inputs.length > 0) {

        for (let input of inputs) {

            if (input.type !== "button" && input.type !== "submit") {
                // console.log(input.type)
                input_list.push((input.name) ? input.name : input.value);
                input.style.border = "2px solid red";
            }
        }
        // browser.browserAction.setBadgeText({text: "1"});
        // alert(`There are ${inputs.length} input fields with these names: ${input_list}`);
        //
        // console.log(inputs);
        // console.log(`There are ${inputs}`)
        browser.runtime.sendMessage({"count": inputs.length, "fields": input_list});
    }
}