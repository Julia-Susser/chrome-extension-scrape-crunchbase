chrome.runtime.onInstalled.addListener(() => {
    chrome.storage.local.set({ greeting: 'Hello, World!' }, () => {
        console.log('Value is set to Hello, World!');
    });
});

// chrome.runtime.onMessage.addListener(function (content, sendResponse) {
//   console.log("hey julia!")
// });

console.log("hi from background")
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log("here in backgrounx")
  if (request.greeting === "hello from content script") {
    console.log(request.greeting);
    sendResponse({ response: "hello from service worker" });
  }
});

// chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
//     console.log('Received content:', request);
//     sendResponse({ success: true });
//     return true; // Keeps the messaging channel open for sendResponse
// });
