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
            "city", "state", "country", "zip", "phone", "postal",
            "phone-number", "email", "cc_number", "cc_cvv", "cc_month", "cc_year",
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
        else if (document.defaultView.getComputedStyle(parent).overflowX == 'hidden') {
            let parent_box = parent.getBoundingClientRect();
            let el_box = el.getBoundingClientRect();
            // check if element is outside of parent's box 
            if (el_box.left   >= parent_box.right || el_box.right <= parent_box.right) {
                return true;
            }

        }
        else if (document.defaultView.getComputedStyle(parent).overflowY == 'hidden') {
            let parent_box = parent.getBoundingClientRect();
            let el_box = el.getBoundingClientRect();
            // check if element is outside of parent's box 
            if (el_box.bottom >= parent_box.top   || el_box.top   <= parent_box.bottom) {
                return true;
            }

        }
        node = parent;
        parent = node.parentNode;
    }


    return false
};

var isHiddenByMargins = (el) => {
    let box = el.getBoundingClientRect();
    if (box.right < 0 || box.left > (window.innerWidth || document.documentElement.clientWidth) ||
        box.bottom < 0 || box.top > (window.innerHeight || document.documentElement.clientHeight)) {
        return true
    }
    return false;
};


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

  var bool_props = ["display_none", "no_opacity", "hidden_attr", "visibility_hidden", "hidden_behind", "no_width", "ancestor_overflow", "margin_hidden"]

  var pageSuspicious = false;

  for (let form of forms) {
    // get all inputs that are a child of this form
    // inputs      =  form.getElementsByTagName("input");
    inputs      =  form.querySelectorAll("input, select");

    // inputs.push(...form.getElementsByTagName("select"));
    form_inputs = [];

    let formHasVisibleRelevantInput = false;
    let formHasHiddenRelevantInput  = false;

    // inputs.forEach((input, i) => {
    for (let i = 0; i < inputs.length; i++) {
        let input = inputs[i];
        form_inputs.push({
                'element': input, 
                'name': input.name ? input.name : input.type ? input.type : "None",
                'isSuspicious': false, 
                'hasRelevantName': hasRelevantName(input)
        });


        bool_props.forEach((prop) => {
            form_inputs[i][prop] = false;
        });

        if (form_inputs[i].hasRelevantName) {
            let computedStyle = window.getComputedStyle(input);
            if (hiddenBehindOtherElement(input)) {
                console.log("hiddenBehindOtherElement attack");
                form_inputs[i].isSuspicious = true;
                form_inputs[i].hidden_behind = true;
                formHasHiddenRelevantInput = true;
            }

            // check for display:none attack
            if (recursivePropHasValue(input, "display", "none")) {
                console.log("display none attack");
                form_inputs[i].isSuspicious = true;
                form_inputs[i].display_none = true;
                formHasHiddenRelevantInput = true;
            }

            // check for opacity attack
            if (getRecursivePropertyProduct(input, "opacity") < 0.1) {
                console.log("opacity attack");
                form_inputs[i].isSuspicious = true;
                form_inputs[i].no_opacity   = true;
                formHasHiddenRelevantInput = true;
            }

            // check for 'hidden' attack
            if (recursiveAttrHasValue(input, "hidden", true)) {
                console.log("hidden attack");
                form_inputs[i].isSuspicious = true;
                form_inputs[i].hidden_attr  = true;
                formHasHiddenRelevantInput = true;
            }

            // check for  visibilit='hidden' or 'collapse' attack
            if (computedStyle.visibility == 'hidden' || computedStyle.visibility == 'collapse') {
                console.log("visibility hidden attack");
                form_inputs[i].isSuspicious = true;
                form_inputs[i].visibility_hidden  = true;
                formHasHiddenRelevantInput = true;
            }

            // check for 0 width or height
            if (window.getComputedStyle(input).width == "0px" ||
                window.getComputedStyle(input).height == "0px") {
                console.log("width attack");
                form_inputs[i].isSuspicious = true;
                form_inputs[i].no_width     = true;
                formHasHiddenRelevantInput = true;

            }

            if (hasAncestorOverflow(input)) {
                console.log("ancestor overflow attack");
                form_inputs[i].isSuspicious      = true;
                form_inputs[i].ancestor_overflow = true;
                formHasHiddenRelevantInput = true;
            }

            if (isHiddenByMargins(input)) {
                console.log("margin attack");
                form_inputs[i].isSuspicious  = true;
                form_inputs[i].margin_hidden = true;
                formHasHiddenRelevantInput = true;
            }


            if (!form_inputs[i].isSuspicious) {
                formHasVisibleRelevantInput = true
            }
        }


    };

    console.log("form inputs", form_inputs);

// to count as a proper attack, a form must have:
// (1) At least ONE visible field with a relevant name
// (2) At least ONE hidden field with a relevant name


    if (formHasVisibleRelevantInput && formHasHiddenRelevantInput) {
        pageSuspicious = true;
        console.log('form has visible relevant input and hidden relevant input');

        var susList = "<ul>";
        for (let inp of form_inputs) {
            if (inp.isSuspicious) {
                susList += "<li>" + inp.name + "</li>";
            }
        }
        susList += "</ul>";

        var warning_div = document.getElementById("autofill-warning-div")

        if (warning_div) {
            warning_div.innerHTML = 'AutofillSecurity: Warning! This form has the following hidden values, indicating that it may be trying to steal these values from you using autofill:'+ susList;
        }
        else {
            let warning = '<div id="autofill-warning-div">AutofillSecurity: Warning! This form has the following hidden values, indicating that it may be trying to steal these values from you using autofill:'+ susList + "</div>";

            form.insertAdjacentHTML('beforebegin', warning);
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