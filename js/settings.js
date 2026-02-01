const settingsContainer = document.getElementById("settings-container");
const minimizedQualityInput = document.getElementById("minimized-quality-input");
const fullscreenQualityInput = document.getElementById("fullscreen-quality-input");
const minimizedFramerateInput = document.getElementById("minimized-framerate-input");
const fullscreenFramerateInput = document.getElementById("fullscreen-framerate-input");
const minimizedQualityValue = document.getElementById("minimized-quality-value");
const fullscreenQualityValue = document.getElementById("fullscreen-quality-value");
const minimizedFramerateValue = document.getElementById("minimized-framerate-value");
const fullscreenFramerateValue = document.getElementById("fullscreen-framerate-value");
const autoShareInput = document.getElementById("auto-share-input");

minimizedQualityInput.oninput = applyValues;
fullscreenQualityInput.oninput = applyValues;
minimizedFramerateInput.oninput = applyValues;
fullscreenFramerateInput.oninput = applyValues;

const streamSettingsVersion = 2;
const defaultSettings = createSettingsJSON(0.1, 1, 10, 30, 1);

var settings;
var onUpdate;

export function getSettings() {
    return settings;
}
export function onSettingsUpdate(callback) {
    onUpdate = callback;
}

function loadCookie() {
    const storedSettingsString = getCookie("streamsettings");
    if (storedSettingsString != undefined) {
        try {
            const storedSettings = JSON.parse(storedSettingsString);
            if (storedSettings.version === streamSettingsVersion) {
                setSettings(storedSettings);
                applySettings();
                return;
            } else {
                console.log("Invaild Version stored in Settings cookie. Skipping.");
            }
        } catch (error) {
            console.log("Invaild Json stored in Settings cookie. Skipping.");
        }
    } else {
        console.log("No Settings Cookie found. Skipping.");
    }
    setSettings(defaultSettings);
    applySettings();
}
loadCookie();

document.getElementById("save-btn").addEventListener("click", updateSettings)

function updateSettings() {
    setSettings(extractInputData());
}

function setSettings(newSettings) {
    setCookie("streamsettings", JSON.stringify(newSettings));
    settings = newSettings;
    if (onUpdate !== undefined) {
        onUpdate();
    }
}

function extractInputData() {
    return createSettingsJSON(
        minimizedQualityInput.value,
        fullscreenQualityInput.value,
        minimizedFramerateInput.value,
        fullscreenFramerateInput.value,
        autoShareInput.checked
    );
}

function applySettings() {
    minimizedQualityInput.value = settings.minimized.scaleFactor;
    fullscreenQualityInput.value = settings.fullscreen.scaleFactor;
    minimizedFramerateInput.value = settings.minimized.frameRate;
    fullscreenFramerateInput.value = settings.fullscreen.frameRate;
    autoShareInput.checked = settings.autoShare;
    applyValues();
}

function applyValues() {
    minimizedQualityValue.innerText = Math.round(minimizedQualityInput.value*100);
    fullscreenQualityValue.innerText = Math.round(fullscreenQualityInput.value*100);
    minimizedFramerateValue.innerText = minimizedFramerateInput.value;
    fullscreenFramerateValue.innerText = fullscreenFramerateInput.value;
}

function createSettingsJSON(minQualValue, maxQualValue, minFrameValue, 
                            maxFrameValue, autoShare) {
    return {
        minimized: {
            scaleFactor: minQualValue,
            frameRate: minFrameValue
        },
        fullscreen: {
            scaleFactor: maxQualValue,
            frameRate: maxFrameValue
        },
        version: streamSettingsVersion,
        autoShare: autoShare
    }
}

function getCookie(cname) {
    let name = cname + "=";
    let decodedCookie = decodeURIComponent(document.cookie);
    let ca = decodedCookie.split(';');
    for(let i = 0; i <ca.length; i++) {
      let c = ca[i];
      while (c.charAt(0) == ' ') {
        c = c.substring(1);
      }
      if (c.indexOf(name) == 0) {
        return c.substring(name.length, c.length);
      }
    }
    return undefined;
}

function setCookie(cname, cvalue, exdays) {
    const d = new Date();
    d.setTime(d.getTime() + (exdays*24*60*60*1000));
    let expires = "expires="+ d.toUTCString();
    document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/;SameSite=Strict";
}