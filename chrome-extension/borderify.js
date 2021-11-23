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

            console.log("hidden behind detection");
            console.log("box", el_box.x, el_box.right, el_box.y, el_box.bottom);
            console.log("box2", el2_box.x, el2_box.right, el2_box.y, el2_box.bottom);
            return true;
        }


    }

    return false;
}


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

var recursivePropHasValue = (el, property,value) => {
    var prop = window.getComputedStyle(el).getPropertyValue(property);
    if (prop == value) return true;

    let parent = el.parentNode;
    if (parent.nodeName == "FORM") return false;

    return recursivePropHasValue(parent, property, value);    
};
 
 // recursively sums up the "margin-left" of all elements going from the input element 
// up until the parent form element. 
var getRecursivePropertySum = (el, property) => {
    var prop = parseInt(window.getComputedStyle(el).getPropertyValue(property));
    let parent = el.parentNode;
    if (parent.nodeName == "FORM") return prop;

    return prop + getRecursivePropertySum(parent, property);
};


var getRecursivePropertyProduct = (el, property) => {
    var prop = parseFloat(window.getComputedStyle(el).getPropertyValue(property));
    let parent = el.parentNode;
    if (parent.nodeName == "FORM") return prop;

    return prop*getRecursivePropertyProduct(parent, property);
};

var recursiveAttrHasValue = (el, attr,value) => {
    var prop = el[attr];
    if (prop == value) return true;

    let parent = el.parentNode;
    if (parent.nodeName == "FORM") return false;

    return recursiveAttrHasValue(parent, attr, value);    
};


var hasAncestorOverflow = (el) => {
    let node = el;
    let parent = node.parentNode;
    while (parent.nodeName != "FORM") {
        if (document.defaultView.getComputedStyle(parent).overflow == 'hidden') {
            let parent_box = parent.getBoundingClientRect();
            let el_box = el.getBoundingClientRect();
            // check if element is outside of parent's box 
            if (el_box.left   >= parent_box.right || el_box.right <= parent_box.right ||
                el_box.bottom >= parent_box.top   || el_box.top   <= parent_box.bottom) {

                return true;
            }

        }
        node = parent;
        parent = node.parentNode;
    }


    return false


}


// The body of this function will be executed as a content script inside the
// current page
function investigateInputs() {
    // get all forms on a page
    const forms  = document.getElementsByTagName("form");




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

            // check for display:none attack
            if (recursivePropHasValue(input, "display", "none")) {
                console.log("display none attack");
                form_inputs[i].isSuspicious = true;
                pageSuspicious = true;   
            }

            // check for opacity attack
            if (getRecursivePropertyProduct(input, "opacity") < 0.1) {
                console.log("opacity attack");
                form_inputs[i].isSuspicious = true;
                pageSuspicious = true;   
            }

            // check for 'hidden' attack
            if (recursiveAttrHasValue(input, "hidden", true)) {
                console.log("hidden attack");
                form_inputs[i].isSuspicious = true;
                pageSuspicious = true;   
            }

            // check for 0 width or height
            if (window.getComputedStyle(input).width == "0px" ||
                window.getComputedStyle(input).height == "0px") {
                console.log("width attack");
                form_inputs[i].isSuspicious = true;
                pageSuspicious = true;   

            }

            if (hasAncestorOverflow(input)) {
                console.log("ancestor overflow attack");
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
            console.log("margin attack");
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