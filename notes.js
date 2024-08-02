
// chrome.storage.local.get(['greeting'], (result) => {
    // if (chrome.runtime.lastError) {
        // console.error(chrome.runtime.lastError.message);
        // return;
    // }
    // document.getElementById('output').innerText = 'Stored Value: ' + result.greeting;
// });


// 	chrome.extension.getBackgroundPage().chrome.tabs.executeScript(null, {
// 		file: 'background.js'
// });;


// "content_scripts": [
//   {
//     "matches": ["<all_urls>"],
//     "js": ["content.js"]
//   }
// ]

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
