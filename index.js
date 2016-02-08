var preferences = require("sdk/simple-prefs");
var hotkeyManager = require("./lib/hotkeyManager");
var pageWorkerManager = require("./lib/pageWorkerManager");

//attach content scripts to appropriate websites
exports.main = function (options, callbacks) {
    pageWorkerManager.RegisterContentScripts();
};

exports.onUnload = function (reason) {
    hotkeyManager.UnregisterHotkeys();
};

function onPrefChange() { //re-register content scripts
    hotkeyManager.UnregisterHotkeys();
    pageWorkerManager.RegisterContentScripts();
}

preferences.on("", onPrefChange);