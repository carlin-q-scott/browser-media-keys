var supportedPageDomains = ["pandora.com", "tidalhifi.com", "youtube.com", "bandcamp.com", "play.google.com"];
var hotkeyManager;

//attach content scripts to appropriate websites
exports.main = function (options, callbacks) {
    hotkeyManager = require("./lib/hotkeyManager");
    hotkeyManager.RegisterContentScripts(supportedPageDomains);
};

exports.onUnload = function (reason) {
    hotkeyManager.UnregisterHotkeys();
    hotkeyManager = null;
};