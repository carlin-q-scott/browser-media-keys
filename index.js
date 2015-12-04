var supportedPageDomains = [
    "pandora.com", "tidalhifi.com", "youtube.com", "bandcamp.com", "play.google.com",
    "play.spotify.com", "player.spotify.com", "soundcloud.com", "music.yandex.ru", "vk.com",
    "radio.yandex.ru"
];
var preferences = require("sdk/simple-prefs");
var jamstashDomains = preferences.prefs.JamstashDomains.split(" ");

var hotkeyManager;

//attach content scripts to appropriate websites
exports.main = function (options, callbacks) {
    hotkeyManager = require("./lib/hotkeyManager");
    hotkeyManager.RegisterContentScripts(supportedPageDomains, jamstashDomains);
};

exports.onUnload = function (reason) {
    hotkeyManager.UnregisterHotkeys();
    hotkeyManager = null;
};

function onPrefChange(prefName) {
    JamstashDomains = preferences.prefs.jamstashDomains.split(" ");
    hotkeyManager.UnregisterHotkeys();
    hotkeyManager = require("./lib/hotkeyManager");
    hotkeyManager.RegisterContentScripts(supportedPageDomains, jamstashDomains);
}

preferences.on("JamstashDomains", onPrefChange);