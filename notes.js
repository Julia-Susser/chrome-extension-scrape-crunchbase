
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



document.getElementById('saveHTML').addEventListener('click', async () => {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

  // Inject content script to get innerHTML
  chrome.scripting.executeScript({
    target: { tabId: tab.id },
    func: () => {
      function getTextNodesWithTags(node) {
        const walker = document.createTreeWalker(node, NodeFilter.SHOW_TEXT, null, false);
        const nodes = [];
        let currentNode;

        while (currentNode = walker.nextNode()) {
          const parentTags = [];
          let parentNode = currentNode.parentNode;

          while (parentNode && parentNode.nodeType === Node.ELEMENT_NODE) {
            parentTags.push(parentNode.tagName.toLowerCase());
            parentNode = parentNode.parentNode;
          }

          nodes.push({ text: currentNode.nodeValue.trim(), tags: parentTags.reverse() });
        }

            return nodes.filter(node => node.text.length > 0);
          }

          return getTextNodesWithTags(document.body);
        },
}, (injectionResults) => {
    for (const frameResult of injectionResults) {
        const textContent = frameResult.result; // Now this is just the text content, no HTML
        console.log('Text Content:', textContent);
    }
});

});
