var hotkeyWorker = null;
var pageWorkerManager = require("./pageWorkerManager");

var RegisterFirefoxHotkeys = function () {
    hotkeyWorker = require("./firefoxHotkeys");
    hotkeyWorker.addEventListener(pageWorkerManager.EmitEventToActivePageWorker);
    hotkeyWorker.postMessage("attach");
};

var RegisterHotkeys = function()
{
    if (hotkeyWorker != null) return;
    var system = require("sdk/system");

    switch (system.platform)
    {
        case "winnt":
            console.log("Registering global hotkeys");
            var {Cu} = require("chrome");
            var {ChromeWorker} = Cu.import("resource://gre/modules/Services.jsm", null);
            hotkeyWorker = new ChromeWorker(require("sdk/self").data.url("windowsHotkeys.js"));
            hotkeyWorker.addEventListener("message", pageWorkerManager.EmitEventToActivePageWorker);
            hotkeyWorker.onerror = RegisterFirefoxHotkeys;
            hotkeyWorker.postMessage("attach");
            break;
        case "linux":
            console.log("Registering DBus hotkeys");
            hotkeyWorker = require("./linuxDBusHotkeys");
            hotkeyWorker.addEventListener(pageWorkerManager.EmitEventToActivePageWorker);
            if (hotkeyWorker.gLibsExist) {
                try
                {
                    hotkeyWorker.postMessage("attach");
                }
                catch (exception)
                {
                    RegisterFirefoxHotkeys();
                }
                break;
            } else {
                console.log("DBus not supported. glib, gobject and gio libaries are required.");
            }
        default:
            console.log("Global hotkeys not supported for " + system.platform + ". Falling back to browser hotkeys");
            RegisterFirefoxHotkeys();
    }

};

var UnregisterHotkeys = function(){
    if (hotkeyWorker != null){
        hotkeyWorker.postMessage("detach");
        hotkeyWorker.removeEventListener("message", pageWorkerManager.EmitEventToActivePageWorker);
        hotkeyWorker = null;
        console.log("Unregistered hotkeys");
    }
};

exports.RegisterHotkeys = RegisterHotkeys;
exports.UnregisterHotkeys = UnregisterHotkeys;