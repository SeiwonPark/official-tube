const matchingUrls = {
  url: [{ urlMatches: "https://www.youtube.com/results*" }],
};

const injectCss = (tabId) => {
  chrome.scripting.insertCSS({
    target: { tabId: tabId },
    files: ["styles/inject.css"],
  });
};

const runScript = (tabId) => {
  chrome.scripting.executeScript({
    target: { tabId: tabId, allFrames: true },
    files: ["scripts/content.js"],
  });
};

chrome.webNavigation.onCompleted.addListener((details) => {
  runScript(details.tabId);
  injectCss(details.tabId);
}, matchingUrls);

chrome.webNavigation.onHistoryStateUpdated.addListener((details) => {
  runScript(details.tabId);
  injectCss(details.tabId);
}, matchingUrls);
