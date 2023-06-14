const filters = {
  url: [{ urlMatches: "https://www.youtube.com/results*" }],
};

const injectCss = (details) => {
  chrome.scripting.insertCSS({
    target: { tabId: details.tabId },
    files: ["styles/inject.css"],
  });
};

const injectScript = (details) => {
  chrome.scripting.executeScript({
    target: { tabId: details.tabId, allFrames: true },
    files: ["scripts/content.js"],
  });
};

/**
 * Callback function for chrome.webNavigation events.
 *
 * @param {Object} details - The navigation event details.
 * @param {Function} callback - The callback function to be invoked.
 *
 * @property {('prerender'|'active'|'cached'|'pending_deletion')} details.documentLifecycle - The lifecycle the document is in.
 * @property {number} details.frameId - 0 indicates the navigation happens in the tab content window; a positive value indicates navigation in a subframe. Frame IDs are unique for a given tab and process.
 * @property {('outermost_frame'|'fenced_frame'|'sub_frame')} details.frameType - The type of frame the navigation occurred in.
 * @property {string} [details.parentDocumentId] - A UUID of the parent document owning this frame. This is not set if there is no parent.
 * @property {number} details.parentFrameId - The ID of the parent frame, or -1 if this is the main frame.
 * @property {number} details.tabId - The ID of the tab in which the navigation is about to occur.
 * @property {number} details.timeStamp - The time when the browser was about to start the navigation, in milliseconds since the epoch.
 * @property {string} details.url - The URL of the document to be loaded.
 *
 * @returns {void}
 */
const webNavigationCallback = (details) => {
  injectScript(details);
  injectCss(details);
};

chrome.webNavigation.onCompleted.addListener(webNavigationCallback, filters);
chrome.webNavigation.onHistoryStateUpdated.addListener(
  webNavigationCallback,
  filters
);
