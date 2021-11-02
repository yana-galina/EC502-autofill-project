document.body.style.border = "5px solid blue";

function find_fields() {
    let input_list = [];
    let inputs = document.getElementsByTagName("input")
    if (inputs.length > 0) {

        for (let input of inputs) {
           input_list.push((input.id) ? input.id: input.name);
        }
        alert(`There are ${inputs.length} input fields with these names: ${input_list}`);
        // console.log(inputs);
        // console.log(`There are ${inputs}`)
    }
}
find_fields();