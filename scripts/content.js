(() => {
  const OFFICIAL_TUBE_STATE_KEY = "official-tube-toggle-state";

  // Separate util functions to local scope.
  var utils = {
    getToggleState: async () => {
      return new Promise((resolve) => {
        chrome.storage.local.get(OFFICIAL_TUBE_STATE_KEY, (result) => {
          resolve(result[OFFICIAL_TUBE_STATE_KEY]);
        });
      });
    },

    getImageUrl: (state) => {
      const currentState = state === "enabled" ? "enabled" : "disabled";
      return chrome.runtime.getURL(`assets/${currentState}.png`);
    },

    updateImageSrc: async (imageElement) => {
      const state = await this.getToggleState();
      imageElement.src = this.getImageUrl(state);
    },

    toggleState: (currentState) => {
      return currentState.endsWith("disabled.png") ? "enabled" : "disabled";
    },

    setToggleState: async (state) => {
      if (chrome.runtime?.id) {
        await chrome.storage.local.set({
          [OFFICIAL_TUBE_STATE_KEY]: state,
        });
      }
    },

    filterVideoList: async () => {
      if (chrome.runtime?.id) {
        const state = await this.getToggleState();
        var videoList = document.querySelectorAll("ytd-video-renderer");

        if (videoList) {
          videoList.forEach((video) => {
            const title = video.querySelector("h3")?.textContent?.trim();
            const badge = video.querySelector(".badge-style-type-verified");
            const artist = video.querySelector(
              ".badge-style-type-verified-artist"
            );

            if (!(title?.includes("MV") || badge || artist)) {
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

    var videoListContainer = document.querySelector("#contents");
    if (videoListContainer) {
      observer.observe(videoListContainer, { childList: true, subtree: true });
    }
  })();
})();
