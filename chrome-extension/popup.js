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
	const element = document.getElementsByTagName("form");
  const inputs = document.getElementsByTagName("input");



  var allDescendants = (el) => {
    var margin = parseInt(window.getComputedStyle(el).getPropertyValue('margin-left'));
    for (let child of el.children) {
      margin +=  allDescendants(child);

    }
    return margin;
  };

  var allParents = (el) => {
    var margin = parseInt(window.getComputedStyle(el).getPropertyValue('margin-left'));
    let parent = el.parentNode;
    if (parent.nodeName == "FORM") return margin;

    return margin + allParents(parent);


  };


  console.log(inputs);
  names = [];
  var margins = [];

  for (let input of inputs) {
    names.push(input.name)
    console.log(window.getComputedStyle(input).getPropertyValue('margin-left'));
    console.log("margin sum", allParents(input));
    margins.push(allParents(input))

  }

  var differing_margins = [];
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
    alert("potential suspicous hidden inputs " + differing_margins);
  }
}

