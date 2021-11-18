// Initialize button with user's preferred color
let changeColor = document.getElementById("changeColor");

chrome.storage.sync.get("color", ({ color }) => {
  changeColor.style.backgroundColor = color;
});


// When the button is clicked, inject setPageBackgroundColor into current page
changeColor.addEventListener("click", async () => {
  let [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

  chrome.scripting.executeScript({
    target: { tabId: tab.id },
    function: findForm,
  });
});


function allDescendants (el) {
  var margin = 0;
    for (let child of el.children) {
      allDescendants(child);
      margin =  parseInt(window.getComputedStyle(child).getPropertyValue('margin-left'));

    }
}


// The body of this function will be executed as a content script inside the
// current page
function findForm() {
  // get all forms on a page
	const forms  = document.getElementsByTagName("form");
  // const inputs = document.getElementsByTagName("input");

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
    potential_names = ["name", "first-name","last-name", "organization", "address",
     "city", "state", "zip", "phone", "phone-number", "email"];

    if (potential_names.includes(el.getAttribute("name"))) {
      return true;
    }

    return false;

  }


  var margins = [];
  var differing_margins = [];
  var inputs;

  for (let form of forms) {
    // get all inputs that are a child of this form
    inputs =  form.getElementsByTagName("input");
    margins = [];

    for (let input of inputs) {
      margins.push(getRecursivePropertySum(input, 'margin-left'));
      console.log("rl " + input.getAttribute("name") + "has relevant name? " + hasRelevantName(input));

    }

    differing_margins = [];
    for (let margin of margins) {
      if (differing_margins.length == 0) {
        differing_margins.push(margin);
      }
      else {
        let found_bucket = false;
        for (let m of differing_margins) {
          if (Math.abs(margin - m) < 200) {
            found_bucket = true;
            break;
          }
        }
        if (!found_bucket) {
          differing_margins.push(margin)
        }
      }

    }

    if (differing_margins.length > 1) {
      alert("potential suspicous hidden inputs with margins " + differing_margins);
    }

  }

}

