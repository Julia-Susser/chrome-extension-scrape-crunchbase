document.getElementById('getValue').addEventListener('click', () => {
  // createLogFile();
  content = document.body.innerHTML
  listFilesInRoot()
  downloadLogFile();
  // appendHtmlToFile(content);
});

createLogFile();

window.addEventListener('load', function (evt) {
// 	chrome.extension.getBackgroundPage().chrome.tabs.executeScript(null, {
// 		file: 'background.js'
	// });;
});


document.getElementById('downloadLogBtn').addEventListener('click', function() {
  chrome.runtime.sendMessage({ action: 'downloadLog' }, function(response) {
    if (response.success) {
      const link = document.createElement('a');
      link.href = response.url;
      link.download = 'log.txt';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      console.log('Log file download initiated.');
    } else {
      console.error('Failed to download log file: ' + response.error);
    }
  });
});


chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log("hi")
  if (request.action === 'saveHtml') {
    appendHtmlToFile(request.htmlContent, sendResponse);
    return true;  // Will respond asynchronously.
  } else if (request.action === 'listFiles') {
    listFilesInRoot(sendResponse);
    return true;  // Will respond asynchronously.
  } else if (request.action === 'downloadLog') {
    downloadLogFile(sendResponse);
    return true;  // Will respond asynchronously.
  }
});


//local storage
// 
  // chrome.storage.local.get(['greeting'], (result) => {
      // if (chrome.runtime.lastError) {
          // console.error(chrome.runtime.lastError.message);
          // return;
      // }
      // document.getElementById('output').innerText = 'Stored Value: ' + result.greeting;
  // });

    
function appendHtmlToFile(content) {
  window.requestFileSystem = window.requestFileSystem || window.webkitRequestFileSystem;
  
  function onInitFs(fs) {
    fs.root.getFile('log.txt', { create: true }, function(fileEntry) {
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
    }, errorHandler);
  }

  function errorHandler(e) {
    console.error('Error: ', e);
  }

  window.requestFileSystem(window.TEMPORARY, 1024 * 1024, onInitFs, errorHandler);
}


function listFilesInRoot() {
  window.requestFileSystem = window.requestFileSystem || window.webkitRequestFileSystem;
  
  function onInitFs(fs) {
    const dirReader = fs.root.createReader();
    const entries = [];

    const readEntries = function() {
      dirReader.readEntries(function(results) {
        if (!results.length) {
          console.log('Files in root:', entries);
        } else {
          for (let i = 0; i < results.length; i++) {
            entries.push(results[i].name);
          }
          readEntries();
        }
      }, errorHandler);
    };

    readEntries();  // Start reading entries
  }

  function errorHandler(e) {
    console.error('Error: ', e);
  }

  window.requestFileSystem(window.TEMPORARY, 1024 * 1024, onInitFs, errorHandler);
}


function createLogFile() {
  window.requestFileSystem = window.requestFileSystem || window.webkitRequestFileSystem;
  
  function onInitFs(fs) {
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
  }

  function errorHandler(e) {
    console.error('Error: ', e);
  }

  window.requestFileSystem(window.TEMPORARY, 1024 * 1024, onInitFs, errorHandler);
}

function downloadLogFile(sendResponse) {
  window.requestFileSystem = window.requestFileSystem || window.webkitRequestFileSystem;

  function onInitFs(fs) {
    fs.root.getFile('log.txt', {}, function(fileEntry) {
      fileEntry.file(function(file) {
        const reader = new FileReader();

        reader.onloadend = function(e) {
          const url = URL.createObjectURL(new Blob([this.result], { type: 'text/plain' }));
          sendResponse({ success: true, url: url });
        };

        reader.onerror = function(e) {
          console.error('Read failed: ' + e.toString());
          sendResponse({ success: false, error: e.toString() });
        };

        reader.readAsText(file);
      }, errorHandler);
    }, errorHandler);
  }

  function errorHandler(e) {
    console.error('Error: ', e);
    sendResponse({ success: false, error: e.toString() });
  }

  window.requestFileSystem(window.TEMPORARY, 1024 * 1024, onInitFs, errorHandler);
}