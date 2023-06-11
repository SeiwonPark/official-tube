const OFFICIAL_TUBE_STATE_KEY = "official-tube-toggle-state";

const getToggleState = async () => {
  return new Promise((resolve) => {
    chrome.storage.local.get(OFFICIAL_TUBE_STATE_KEY, (result) => {
      resolve(result[OFFICIAL_TUBE_STATE_KEY]);
    });
  });
};

const getImageUrl = (state) => {
  const currentState = state === "enabled" ? "enabled" : "disabled";
  return chrome.runtime.getURL(`assets/${currentState}.png`);
};

const updateImageSrc = async (imageElement) => {
  const state = await getToggleState();
  imageElement.src = getImageUrl(state);
};

const toggleState = (currentState) => {
  return currentState.endsWith("disabled.png") ? "enabled" : "disabled";
};

const setToggleState = async (state) => {
  await chrome.storage.local.set({
    [OFFICIAL_TUBE_STATE_KEY]: state,
  });
};

async function filterVideoList() {
  const state = await getToggleState();
  var videoList = document.querySelectorAll("ytd-video-renderer");

  if (videoList) {
    videoList.forEach((video) => {
      const title = video.querySelector("h3")?.textContent?.trim();
      const badge = video.querySelector(".badge-style-type-verified");

      if (!(title?.includes("MV") || badge)) {
        video.style.display = state === "enabled" ? "none" : "";
      }
    });
  }
}

async function main() {
  var filterMenu = document.querySelector("#filter-menu");

  if (filterMenu) {
    filterMenu.style.cssText = "display:flex;flex-direction:row;";
    var toggleWrapper = document.createElement("div");
    var toggleButton = document.createElement("button");
    var toggleImage = document.createElement("img");

    toggleWrapper.className = "tg__wrapper";
    toggleButton.className = "tg__button";
    toggleImage.width = 24;

    await updateImageSrc(toggleImage);

    toggleButton.appendChild(toggleImage);
    toggleWrapper.appendChild(toggleButton);
    filterMenu.appendChild(toggleWrapper);

    toggleButton.addEventListener("click", async () => {
      const targetState = toggleState(toggleImage.src);
      toggleImage.src = getImageUrl(targetState);
      await setToggleState(targetState);
      await filterVideoList();
    });
  }

  filterVideoList();

  var observer = new MutationObserver(async (mutationsList, _observer) => {
    for (let mutation of mutationsList) {
      if (mutation.type === "childList" && mutation.addedNodes.length > 0) {
        await filterVideoList();
        break;
      }
    }
  });

  var videoListContainer = document.querySelector("#contents");
  observer.observe(videoListContainer, { childList: true, subtree: true });
}

main();
