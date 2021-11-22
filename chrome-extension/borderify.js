/* This is a content script that runs in the tab itself*/

chrome.runtime.onMessage.addListener(run_func);
function run_func(message) {
    console.log("calling run_func in borderify.js")
    if(message.greeting === "run"){
        find_fields();
    }
    if(message.message === "start"){
       find_fields();

    }
}


function hiddenBehindOtherElement(el) {
    var all = document.getElementsByTagName("*");

    var el_box = el.getBoundingClientRect();

    for (let i = 0; i< all.length; i++) {
        let el2 = all[i];

        if (el2.contains(el)) {
            continue;
        }

        let el2_box = el2.getBoundingClientRect();

        if(el_box.x >= el2_box.x && el_box.right <= el2_box.right &&
            el_box.y >= el2_box.y && el_box.bottom <= el2_box.bottom) {

            return true;
        }


    }

    return false;
}



// The body of this function will be executed as a content script inside the
// current page
function investigateInputs() {
    // get all forms on a page
    const forms  = document.getElementsByTagName("form");

     // recursively sums up the "margin-left" of all elements going from the input element 
    // up until the parent form element. 
    var getRecursivePropertySum = (el, property) => {
        var prop = parseInt(window.getComputedStyle(el).getPropertyValue(property));
        let parent = el.parentNode;
        if (parent.nodeName == "FORM") return prop;

        return prop + getRecursivePropertySum(parent, property);
    };

    // check if el has a name that could be exploited by autofill
    var hasRelevantName = (el) => {
        potential_names = [
            "name", "first-name", "middle-name",
            "last-name", "organization", "address",
            "city", "state", "zip", "phone", "postal",
            "phone-number", "email", "cc_number", "cc_cvv",
        ];

        
        if (potential_names.includes(el.getAttribute("name"))) {
            return true;
        }

        return false;

    }


  var margins = [];
  var differing_margins = [];
  var inputs;
  var all_inputs  = [];
  var form_inputs = [];
  var margin = null;

  var props = ["margin-left", "margin-right", "margin-bottom", "margin-top", "margin"]

  var pageSuspicious = false;

  for (let form of forms) {
    // get all inputs that are a child of this form
    inputs      =  form.getElementsByTagName("input");
    margins     = [];
    form_inputs = [];

    // inputs.forEach((input, i) => {
    for (let i = 0; i < inputs.length; i++) {
        let input = inputs[i];
        form_inputs.push({
                'element': input, 
                'name': input.getAttribute("name") ? input.getAttribute("name") : "None",
                'isSuspicious': false, 
                // prop: margin, 
                'hasRelevantName': hasRelevantName(input)
        });

        for (let prop of props) {
            margin = getRecursivePropertySum(input, prop);
            form_inputs[i][prop] = margin;

        }

        if (form_inputs[i].hasRelevantName) {
            if (hiddenBehindOtherElement(input)) {
                console.log("hidden hiddenBehindOtherElement");
                form_inputs[i].isSuspicious = true;
                pageSuspicious = true;   
            }
        }


    };

    console.log("form inputs", form_inputs);


     

    for (let prop of props) {
        differing_margins = [];
        form_inputs.forEach((inp, i) => {
            if (differing_margins.length == 0) {
                differing_margins.push({prop: inp[prop], 'inputs': [i]});
            }
            else {
                let found_bucket = false;
                for (let m of differing_margins) {
                    if (Math.abs(inp[prop] - m[prop]) < 200) {
                        found_bucket = true;
                        m.inputs.push(i);
                        break;
                    }
                }
                if (!found_bucket) {
                    differing_margins.push({prop: inp[prop], 'inputs': [i]});
                }
            }
        });


        // console.log("differing_margins", differing_margins);
        if (differing_margins.length > 1) {
            form_inputs = form_inputs.map((el) => {
                if (el.hasRelevantName) {
                    pageSuspicious = true;
                     return {
                        ...el, 
                        isSuspicious: true,
                    };
                }
                else return el;
               
            });
            // alert("potential suspicous hidden inputs with margins " + differing_margins);
        }

    }

    all_inputs.push(...form_inputs);
  }
  return {'pageSuspicious': pageSuspicious, 'inputs': all_inputs};

}



function find_fields() {
    var results = investigateInputs();
    console.log("Investigated page: ", results);

    chrome.runtime.sendMessage({
        "count": results.inputs.length, 
        "fields": results.inputs,
        "pageSuspicious": results.pageSuspicious,
    }); 

}