/**
 * This script is used to create a toggle button in the YouTube filter menu.
 * When the button is `enabled`, all YouTube videos in the video list that are not music videos
 * (i.e., videos that are not from verified channels or artists) will be hidden.
 * When the button is `disabled`, all videos will be displayed normally.
 * The button state (enabled or disabled) is stored in Chrome's local storage
 * and will be preserved across browser sessions.
 */

import "../styles/inject.css";

(() => {
  const OFFICIAL_TUBE_STATE_KEY = "official-tube-toggle-state";

  // Separate util functions to local scope.
  var utils = {
    detectSystemTheme: function () {
      return window.matchMedia &&
        window.matchMedia("(prefers-color-scheme: dark)").matches
        ? "dark"
        : "light";
    },

    getToggleState: async function () {
      return new Promise((resolve) => {
        chrome.storage.local.get(OFFICIAL_TUBE_STATE_KEY, (result) => {
          resolve(result[OFFICIAL_TUBE_STATE_KEY]);
        });
      });
    },

    getImageUrl: function (state) {
      const theme = this.detectSystemTheme();
      const currentState =
        state === "enabled" ? "enabled" : `disabled-${theme}`;
      return chrome.runtime.getURL(`assets/${currentState}.png`);
    },

    updateImageSrc: async function (imageElement) {
      const state = await this.getToggleState();
      imageElement.src = this.getImageUrl(state);
    },

    toggleState: function (currentState) {
      const theme = this.detectSystemTheme();
      return currentState.endsWith("enabled.png")
        ? `disabled-${theme}`
        : "enabled";
    },

    setToggleState: async function (state) {
      if (chrome.runtime?.id) {
        await chrome.storage.local.set({
          [OFFICIAL_TUBE_STATE_KEY]: state,
        });
      }
    },

    filterVideoList: async function () {
      if (chrome.runtime?.id) {
        const state = await this.getToggleState();
        var videoList = document.querySelectorAll("ytd-video-renderer");

        if (videoList) {
          videoList.forEach((video) => {
            const badge = video.querySelector(".badge-style-type-verified");
            const artist = video.querySelector(
              ".badge-style-type-verified-artist"
            );

            if (!(badge || artist)) {
              video.style.display = state === "enabled" ? "none" : "";
            }
          });
        }
      }
    },
  };

  var observer = new MutationObserver(async (mutationsList, _) => {
    for (let mutation of mutationsList) {
      if (mutation.type === "childList" && mutation.addedNodes.length > 0) {
        await utils.filterVideoList();
        break;
      }
    }
  });

  // Declare self invoking function to fix variable scoping problem.
  (async () => {
    var filterMenu = document.querySelector("#filter-menu");

    if (filterMenu) {
      filterMenu.style.cssText = "display:flex;flex-direction:row;";
      var toggleWrapper = filterMenu.querySelector(".tg__wrapper");

      if (!toggleWrapper) {
        toggleWrapper = document.createElement("div");
        var toggleButton = document.createElement("button");
        var toggleImage = document.createElement("img");

        toggleWrapper.className = "tg__wrapper";
        toggleButton.className = "tg__button";
        toggleImage.width = 24;

        toggleButton.appendChild(toggleImage);
        toggleWrapper.appendChild(toggleButton);
        filterMenu.appendChild(toggleWrapper);

        toggleButton.addEventListener("click", async () => {
          const targetState = utils.toggleState(toggleImage.src);
          toggleImage.src = utils.getImageUrl(targetState);
          await utils.setToggleState(targetState);
          await utils.filterVideoList();
        });
      } else {
        var toggleImage = toggleWrapper.querySelector("img");
      }

      if (chrome.runtime?.id) {
        await utils.updateImageSrc(toggleImage);
      }
    }

    utils.filterVideoList();

    var videoListContainer = document.querySelector(
      "ytd-section-list-renderer #contents"
    );
    if (videoListContainer) {
      observer.observe(videoListContainer, { childList: true, subtree: true });
    }
  })();
})();
