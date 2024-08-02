

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
    func: () => document.documentElement.innerText,
}, (injectionResults) => {
    for (const frameResult of injectionResults) {
        const textContent = frameResult.result; // Now this is just the text content, no HTML
        console.log('Text Content:', textContent);
    }
});

});

chrome.runtime.onMessage.addListener(function (message) {
	console.log("HIII")
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
    fs.root.getFile('log.txt', { create: false }, function(fileEntry) {
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
    fs.root.getFile('log.txt', { create: false }, function(fileEntry) {
      // File exists, no need to create it
      console.log('Log file already exists.');
    }, function() {
      // File does not exist, create it
      fs.root.getFile('log.txt', { create: true, exclusive: true }, function(fileEntry) {
        fileEntry.createWriter(function(fileWriter) {
          fileWriter.onwriteend = function() {
            console.log('Log file created.');
          };

          fileWriter.onerror = function(e) {
            console.log('Create log file failed: ' + e.toString());
          };

          const blob = new Blob(['Log file initialized.\n'], { type: 'text/plain' });
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
    fs.root.getFile('log.txt', {}, function(fileEntry) {
      fileEntry.file(function(file) {
        const reader = new FileReader();
        reader.onloadend = function(e) {
          const url = URL.createObjectURL(new Blob([this.result], { type: 'text/plain' }));
          const link = document.createElement('a');
          link.href = url;
          link.download = 'log.txt';
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


function appendHtmlToFile(content) {
  window.requestFileSystem = window.requestFileSystem || window.webkitRequestFileSystem;
  function onInitFs(fs) {
    fs.root.getFile('log.txt', { create: false }, function(fileEntry) {
      // File exists, proceed to append content
      fileEntry.createWriter(function(fileWriter) {
        fileWriter.seek(fileWriter.length);  // Move the pointer to the end of the file for appending

        fileWriter.onwriteend = function() {
          console.log('Append completed.');
        };

        fileWriter.onerror = function(e) {
          console.log('Append failed: ' + e.toString());
        };
        const blob = new Blob([content], { type: 'text/plain' });
        fileWriter.write(blob);
      }, errorHandler);
    }, function(e) {
      // File does not exist, log message
      if (e.code === FileError.NOT_FOUND_ERR) {
        console.log('log.txt file does not exist.');
      } else {
        errorHandler(e);
      }
    });
  }
  function errorHandler(e) {
    console.error('Error: ', e);
  }

  window.requestFileSystem(window.TEMPORARY, 1024 * 1024, onInitFs, errorHandler);
}
