var preferences = require("sdk/simple-prefs");
var hotkeyManager;

//attach content scripts to appropriate websites
exports.main = function (options, callbacks) {
    hotkeyManager = require("./lib/hotkeyManager");
    hotkeyManager.RegisterContentScripts();
};

exports.onUnload = function (reason) {
    hotkeyManager.UnregisterHotkeys();
    hotkeyManager = null;
};

function onPrefChange() { //re-register content scripts
    hotkeyManager.UnregisterHotkeys();
    hotkeyManager = require("./lib/hotkeyManager");
    hotkeyManager.RegisterContentScripts();
}

preferences.on("", onPrefChange);