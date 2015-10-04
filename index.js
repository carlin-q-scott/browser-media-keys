var preferences = require("sdk/simple-prefs");
var JamstashDomains = preferences.prefs.JamstashDomains.split(" ");
var supportedPageDomains_raw = ["pandora.com", "tidalhifi.com", "youtube.com", "bandcamp.com", "play.google.com", "player.spotify.com", "soundcloud.com"].concat(JamstashDomains);
var hotkeyManager;

var supportedPageDomains = supportedPageDomains_raw

//attach content scripts to appropriate websites
exports.main = function (options, callbacks) {
    hotkeyManager = require("./lib/hotkeyManager");
    hotkeyManager.RegisterContentScripts(supportedPageDomains, JamstashDomains);
};

exports.onUnload = function (reason) {
    hotkeyManager.UnregisterHotkeys();
    hotkeyManager = null;
};

function onPrefChange(prefName) {
	JamstashDomains = preferences.prefs.JamstashDomains.split(" ");
	supportedPageDomains = supportedPageDomains_raw.concat(JamstashDomains);
	hotkeyManager.UnregisterHotkeys();
    hotkeyManager = null;
	hotkeyManager = require("./lib/hotkeyManager");
    hotkeyManager.RegisterContentScripts(supportedPageDomains, JamstashDomains);
}

preferences.on("JamstashDomains", onPrefChange);