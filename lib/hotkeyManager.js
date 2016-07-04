/* global console */

var { ChromeWorker, Cu } = require('chrome');
Cu.import('resource://gre/modules/Services.jsm');
Services.scriptloader.loadSubScript('resource://jid1-4gp7z3tkud3tzg-at-jetpack/lib/comm/Comm.js');

var hotkeyWorker = null;
var pageWorkerManager = require("./pageWorkerManager");
var fellBackToFirefoxHotkeys = false;

var gWkComm;
var callInHotkeyworker = CommHelper.bootstrap.callInMainworker;

function EmitEventToActivePageWorker(aArg) {
    pageWorkerManager.EmitEventToActivePageWorker({
        data: aArg
    });
}

var RegistrationErrorHandler = function (error) {
    console.log(`falling back to firefox hotkeys due to: "${error.message}" in ${error.filename}:${error.lineno}-${error.colno}`);
    if (!fellBackToFirefoxHotkeys) {
        fellBackToFirefoxHotkeys = true;
        RegisterFirefoxHotkeys();
    }
};

var RegisterFirefoxHotkeys = function () {
    hotkeyWorker = require("./firefoxHotkeys");
    hotkeyWorker.addEventListener(pageWorkerManager.EmitEventToActivePageWorker);
    hotkeyWorker.postMessage("attach");
};

var RegisterHotkeys = function()
{
    if (hotkeyWorker != null) return;
    var system = require("sdk/system");

    var UseMkWin = require("sdk/simple-prefs").prefs.UseMkWin;

    gWkComm = new Comm.server.worker('resource://jid1-4gp7z3tkud3tzg-at-jetpack/lib/HotkeyWorker.js');
    callInHotkeyworker('attach', { UseMkWin }, function(aAttached) {
        console.log('back in manager from attach, aAttached:', aAttached);
        if (!aAttached) {
            console.log("Global hotkeys not supported for " + system.platform + ". Falling back to browser hotkeys");
            RegisterFirefoxHotkeys();
            gWkComm.unregister(); // will terminate the ChromeWorker
            gWkComm = null;
        }
    });

    // switch (system.platform)
    // {
    //     case "winnt":
    //         console.log("Registering global hotkeys");
    //         if (require("sdk/simple-prefs").prefs.UseMkWin){
    //             hotkeyWorker = require("./mk-win.js");
    //             hotkeyWorker.addEventListener(pageWorkerManager.EmitEventToActivePageWorker);
    //             hotkeyWorker.onerror = RegistrationErrorHandler;
    //             //hotkeyWorker.postMessage("debug");
    //         }
    //         else{
    //             var {Cu} = require("chrome");
    //             var {ChromeWorker} = Cu.import("resource://gre/modules/Services.jsm", null);
    //             hotkeyWorker = new ChromeWorker(require("sdk/self").data.url("../lib/windowsHotkeys.js"));
    //             hotkeyWorker.addEventListener("message", pageWorkerManager.EmitEventToActivePageWorker);
    //             hotkeyWorker.onerror = RegisterFirefoxHotkeys;
    //         }
    //         hotkeyWorker.postMessage("attach");
    //         break;
    //     case "linux":
    //         console.log("Registering DBus hotkeys");
    //         hotkeyWorker = require("./linuxDBusHotkeys");
    //         hotkeyWorker.addEventListener(pageWorkerManager.EmitEventToActivePageWorker);
    //         if (hotkeyWorker.gLibsExist) {
    //             try
    //             {
    //                 hotkeyWorker.postMessage("attach");
    //             }
    //             catch (exception)
    //             {
    //                 RegisterFirefoxHotkeys();
    //             }
    //             break;
    //         } else {
    //             console.log("DBus not supported. glib, gobject and gio libaries are required.");
    //         }
    //     case "darwin":
    //         console.log("Registering global hotkeys");
    //         hotkeyWorker = require("./darwinKeys");
    //         hotkeyWorker.addEventListener(pageWorkerManager.EmitEventToActivePageWorker);
    //         hotkeyWorker.postMessage("attach");
    //         break;
    //     default:
    //         console.log("Global hotkeys not supported for " + system.platform + ". Falling back to browser hotkeys");
    //         RegisterFirefoxHotkeys();
    // }

};

var UnregisterHotkeys = function(){
    if (gWkComm) {
        callInHotkeyworker('detach');
        gWkComm.unregister();
        fellBackToFirefoxHotkeys = false;
        console.log("Unregistered hotkeys");
    }

    // if (hotkeyWorker != null){
    //     hotkeyWorker.postMessage("detach");
    //     hotkeyWorker.removeEventListener("message", pageWorkerManager.EmitEventToActivePageWorker);
    //     hotkeyWorker = null;
    //     fellBackToFirefoxHotkeys = false;
    //     console.log("Unregistered hotkeys");
    // }
};

exports.RegisterHotkeys = RegisterHotkeys;
exports.UnregisterHotkeys = UnregisterHotkeys;
