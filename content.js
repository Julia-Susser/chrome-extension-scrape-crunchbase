console.log("In content script");


chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.greeting === "hello from popup") {
    console.log(request.greeting);
    sendResponse({ response: "hello from content script" });
  }
});


chrome.runtime.sendMessage({ greeting: "hello from content script" }, (response) => {
  console.log(response);
});


