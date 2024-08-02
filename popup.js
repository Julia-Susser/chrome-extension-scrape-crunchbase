

createLogFile();

// window.addEventListener('load', function (evt) {
//   chrome.runtime.sendMessage(document.body.innerHTML, sendResponse);
//   // appendHtmlToFile(document.body.innerHTML)
// });


document.getElementById('saveHTML').addEventListener('click', async () => {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

  // Inject content script to get innerHTML
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

      // console.log('Text Elements with Specific Tags:', textElements);
      let allText = textElements.map(el => el.text.trim())
        console.log(allText);


        // Find the index for "Add Column"
        let index = allText.indexOf("Add Column");
        console.log(index)
        if (index === -1) {
          console.error('No "Add Column" found in the text elements.');
          return;
        }

        let sublists = [];
        let temp = [];
        let count = 0
        // Iterate through all text elements and split based on index
        for (let i = 0; i < allText.length; i++) {
          if (allText[i] == ","){
            count -=1
            continue
          }
          if (allText[i] == "Add Column"){
            continue
          }

          if (count % index === 0 && count !== 0) {
            sublists.push(temp);
            temp = [];
          }
          count +=1
          temp.push(allText[i]);





        }

        // Push the last temp array if it has elements
        if (temp.length > 0) {
          sublists.push(temp);
        }


      console.log('Sublists:', sublists);
      appendJsonToFile(sublists)
      // document.getElementById('output').textContent = JSON.stringify(allText, null, 2);
    }
  });

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


// function appendHtmlToFile(content) {
//   window.requestFileSystem = window.requestFileSystem || window.webkitRequestFileSystem;
//   function onInitFs(fs) {
//     fs.root.getFile('log.txt', { create: false }, function(fileEntry) {
//       // File exists, proceed to append content
//       fileEntry.createWriter(function(fileWriter) {
//         fileWriter.seek(fileWriter.length);  // Move the pointer to the end of the file for appending
//
//         fileWriter.onwriteend = function() {
//           console.log('Append completed.');
//         };
//
//         fileWriter.onerror = function(e) {
//           console.log('Append failed: ' + e.toString());
//         };
//         const blob = new Blob([content], { type: 'text/plain' });
//         fileWriter.write(blob);
//       }, errorHandler);
//     }, function(e) {
//       // File does not exist, log message
//       if (e.code === FileError.NOT_FOUND_ERR) {
//         console.log('log.json file does not exist.');
//       } else {
//         errorHandler(e);
//       }
//     });
//   }
//   function errorHandler(e) {
//     console.error('Error: ', e);
//   }
//
//   window.requestFileSystem(window.TEMPORARY, 1024 * 1024, onInitFs, errorHandler);
// }


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

          // Append new content
          currentContent.push(...newContent);

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
