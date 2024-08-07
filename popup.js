

createLogFile();

// window.addEventListener('load', function (evt) {
//   chrome.runtime.sendMessage(document.body.innerHTML, sendResponse);
//   // appendHtmlToFile(document.body.innerHTML)
// });

async function saveHTML(){
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  chrome.scripting.executeScript({
    target: { tabId: tab.id },
    func: () => {
      function getTextNodesWithSpecificTags(node, tags) {
        const walker = document.createTreeWalker(node, NodeFilter.SHOW_TEXT, null, false);
        const nodes = [];
        let currentNode;

        while (currentNode = walker.nextNode()) {
          const parentTags = [];
          let parentNode = currentNode.parentNode;
          let matches = false;

          while (parentNode && parentNode.nodeType === Node.ELEMENT_NODE) {
            if (tags.includes(parentNode.tagName.toLowerCase())) {
              matches = true;
            }
            parentTags.push(parentNode.tagName.toLowerCase());
            parentNode = parentNode.parentNode;
          }

          if (matches) {
            nodes.push({ text: currentNode.nodeValue.trim(), tags: parentTags.reverse() });
          }
        }

        return nodes.filter(node => node.text.length > 0);
      }

      const specificTags = ['sheet-grid']; // Modify this array to include the tags you're interested in
      return getTextNodesWithSpecificTags(document.body, specificTags);
    },
  }, (injectionResults) => {
    for (const frameResult of injectionResults) {
      const textElements = frameResult.result; // This contains text elements with their associated tags
      console.log(textElements)
      // console.log('Text Elements with Specific Tags:', textElements);
      multi_tag = "identifier-multi-formatter"
      let allText = textElements.map(el => {
        return {
            text: el.text.trim(),
            multi: el.tags.includes(multi_tag)
        };
    });
        console.log(allText);


        // Find the index for "Add Column"
        let index = allText.findIndex(el => el.text === "Add Column");
        console.log(index)
        if (index === -1) {
          console.error('No "Add Column" found in the text elements.');
          return;
        }


        let sublists = [];
        let temp = [];
        let multi = []
        let count = 0
        // Iterate through all text elements and split based on index
        for (let i = 0; i < allText.length; i++) {
          if (allText[i].text == ","){
            continue
          }
          if (allText[i].text == "Add Column"){
            continue
          }
         

          if (count % index === 0 && count !== 0) {
            sublists.push(temp);
            temp = [];
          }
          if (!allText[i].multi){
            temp.push(allText[i].text);
            count +=1
          }else if(!allText[i+1].multi){
            multi.push(allText[i].text)
            temp.push(multi)
            multi = []
            count+=1
          }else{
            multi.push(allText[i].text)
          }
        }

      // Push the last temp array if it has elements
      if (temp.length > 0) {
        sublists.push(temp);
      }

      //deal with headquarters location
      let length = sublists[0].length;
      let industries_index = sublists[0].indexOf("Industries");
        
      sublists = sublists.map(sublist => {
            let beforeIndustries = sublist.slice(0, industries_index)
            let industriesSection;
            if (sublist[industries_index]=="Industries"){
              industriesSection = ["Industries"]
            }else{
              industriesSection = [sublist.slice(industries_index, industries_index + sublist.length - length + 1)];

            }
            let afterIndustries = sublist.slice(industries_index + sublist.length - length + 1);
            return beforeIndustries.concat([industriesSection.join(", ")]).concat(afterIndustries);
        });
        
      console.log(sublists)

      console.log('Sublists:', sublists);
      appendJsonToFile(sublists)
      document.getElementById('lastElement').innerText = sublists[sublists.length-1][0];

      document.getElementById('success').innerText = "Operation was successful.";
      // document.getElementById('output').textContent = JSON.stringify(allText, null, 2);
    }
  });
}

document.getElementById('saveHTML').addEventListener('click', async () => {
  await saveHTML()
});







chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    console.log('Received message:', request);
    // Handle the message
});

document.getElementById('download').addEventListener('click', function() {
  downloadLogFile()
});


document.getElementById('reset').addEventListener('click', function() {
  resetLogFile()
});

// document.getElementById('saveHTML').addEventListener('click', () => {
//   const htmlContent = document.documentElement.outerHTML;
//   console.log(htmlContent)
//   appendHtmlToFile(htmlContent)
// });



// send to background.js
// document.getElementById('saveHTML').addEventListener('click', function() {
//     content = "get_html"
//     chrome.runtime.sendMessage(content, response => { console.log(response) }
//     )
// });


// document.addEventListener('DOMContentLoaded', () => {
//   const button = document.getElementById('myButton');
//   button.addEventListener('click', () => {
//     chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
//       chrome.tabs.sendMessage(tabs[0].id, { greeting: "hello from popup" }, (response) => {
//         console.log(response);
//       });
//     });
//   });
// });



function resetLogFile() {
  window.requestFileSystem = window.requestFileSystem || window.webkitRequestFileSystem;
  function onInitFs(fs) {
    fs.root.getFile('log.json', { create: false }, function(fileEntry) {
      // File exists, delete it
      fileEntry.remove(function() {
        console.log('Log file deleted.');
        createLogFile()
      }, errorHandler);
    }, function() {
      console.log('Log file does not exist.');
      createLogFile()
    });
  }

  function errorHandler(e) {
    console.error('Error: ', e);
  }
  window.requestFileSystem(window.TEMPORARY, 1024 * 1024, onInitFs, errorHandler);
  document.getElementById("Before").innerText = "Reset Log File"
  document.getElementById("After").innerText = ""
  document.getElementById("success").innerText = ""
  document.getElementById("lastElement").innerText = ""
}


function createLogFile() {
  window.requestFileSystem = window.requestFileSystem || window.webkitRequestFileSystem;
  function onInitFs(fs) {
    fs.root.getFile('log.json', { create: false }, function(fileEntry) {
      // File exists, no need to create it
      console.log('Log file already exists.');
    }, function() {
      // File does not exist, create it
      fs.root.getFile('log.json', { create: true, exclusive: true }, function(fileEntry) {
        fileEntry.createWriter(function(fileWriter) {
          fileWriter.onwriteend = function() {
            console.log('Log file created.');
          };

          fileWriter.onerror = function(e) {
            console.log('Create log file failed: ' + e.toString());
          };

          const blob = new Blob(['[]'], { type: 'application/json' });
          fileWriter.write(blob);
        }, errorHandler);
      }, errorHandler);
    });
  }
  function errorHandler(e) {
    console.error('Error: ', e);
  }
  window.requestFileSystem(window.TEMPORARY, 1024 * 1024, onInitFs, errorHandler);
}


function downloadLogFile() {
  window.requestFileSystem = window.requestFileSystem || window.webkitRequestFileSystem;
  function onInitFs(fs) {
    fs.root.getFile('log.json', {}, function(fileEntry) {
      fileEntry.file(function(file) {
        const reader = new FileReader();
        reader.onloadend = function(e) {
          const url = URL.createObjectURL(new Blob([this.result], { type: 'text/plain' }));
          const link = document.createElement('a');
          link.href = url;
          link.download = 'log.json';
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          console.log('Log file download initiated.');
        };
        reader.onerror = function(e) {
          console.error('Read failed: ' + e.toString());
        };
        reader.readAsText(file);
      }, errorHandler);
    }, errorHandler);
  }
  function errorHandler(e) {
    console.error('Error: ', e);
  }
  window.requestFileSystem(window.TEMPORARY, 1024 * 1024, onInitFs, errorHandler);
}



function appendJsonToFile(newContent) {
  window.requestFileSystem = window.requestFileSystem || window.webkitRequestFileSystem;

  function onInitFs(fs) {
    fs.root.getFile('log.json', { create: true }, function(fileEntry) {
      // File exists, read and update content
      fileEntry.file(function(file) {
        const reader = new FileReader();

        reader.onloadend = function(e) {
          let currentContent = [];
          if (e.target.result) {
            try {
              currentContent = JSON.parse(e.target.result);
            } catch (err) {
              console.error('Failed to parse existing JSON:', err);
            }
          }

          // Get the length of the current content before appending
          const lengthBefore = currentContent.length;
          document.getElementById("Before").innerText = "Length before: " + lengthBefore;

          // Append new content
          currentContent.push(...newContent);

          // Get the length of the content after appending
          const lengthAfter = currentContent.length;
          document.getElementById("After").innerText = "Length after: " + lengthAfter;

          // Write updated content back to the file
          fileEntry.createWriter(function(fileWriter) {
            fileWriter.onwriteend = function() {
              console.log('Append completed.');
            };

            fileWriter.onerror = function(e) {
              console.log('Append failed: ' + e.toString());
            };

            const blob = new Blob([JSON.stringify(currentContent, null, 2)], { type: 'application/json' });
            fileWriter.write(blob);
          }, errorHandler);
        };

        reader.onerror = function(e) {
          console.error('Failed to read file:', e);
        };

        reader.readAsText(file);
      }, errorHandler);
    }, errorHandler);
  }

  function errorHandler(e) {
    console.error('Error: ', e);
  }

  window.requestFileSystem(window.TEMPORARY, 1024 * 1024, onInitFs, errorHandler);
}


async function injectTheScript() {
  chrome.tabs.query({active: true, currentWindow: true}, tabs => {
      chrome.scripting.executeScript({target: {tabId: tabs[0].id}, files: ['content-script.js']})
  })
}

document.getElementById('clickactivity').addEventListener('click', injectTheScript)


async function goToZero() {
  chrome.tabs.query({active: true, currentWindow: true}, tabs => {
      chrome.scripting.executeScript({target: {tabId: tabs[0].id}, files: ['content-script.js']})
  })
}

// document.getElementById('clickactivity').addEventListener('click', goToZero)


function checkDifference(inputStrings) {
  const s = inputStrings[0].replace(/,/g, "");
  const parts = s.match(/\d+/g);
  console.log(parts)
  if (parts.length === 2) {
      const firstNumber = parseInt(parts[0], 10);
      const secondNumber = parseInt(parts[1], 10);
      const total = inputStrings[1].match(/[\d,]+/);
      console.log(firstNumber, secondNumber, total, ((total - secondNumber)<=0))
      return ((total - secondNumber)<=0) || secondNumber == 1000
  } 
}

async function finished() {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  var txt = await chrome.scripting.executeScript({
    target: { tabId: tab.id },
    function: () => {
        // This function finds and logs the specific text "951-1,000" from within the 'component--results-info' class
        const resultsInfoContainer = document.querySelector('.component--results-info');
        let extractedText = [];

        // Iterate over all child nodes to find the text node
        if (resultsInfoContainer) {
            resultsInfoContainer.childNodes.forEach(node => {
                if (node.nodeType === Node.TEXT_NODE) {
                    extractedText.push(node.textContent.trim());
                }
            });
        }

        console.log(extractedText); // Output to console
        return extractedText; // Optional: return the value if needed for further processing in the extension
    }
  });
  console.log(txt)
  txt = txt[0].result
  return checkDifference(txt)
}
async function run(){
  await saveHTML()
  var done = await finished()
  console.log("done",done)
  if (done){
    return;
  }
  await injectTheScript()
  setTimeout(run, 2000);
}


document.getElementById('run').addEventListener('click', run)