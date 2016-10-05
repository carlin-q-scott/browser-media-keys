/* global console */
const PATH_LIB = 'resource://jid1-4gp7z3tkud3tzg-at-jetpack/lib/';

var { ChromeWorker, Cu } = require('chrome');
Cu.import('resource://gre/modules/Services.jsm');
Cu.import('resource://gre/modules/osfile.jsm');
Services.scriptloader.loadSubScript(PATH_LIB + 'comm/Comm.js');
Services.scriptloader.loadSubScript(PATH_LIB + 'jscSystemHotkey/shtkMainthreadSubscript.js');

var callInMainworker = CommHelper.bootstrap.callInMainworker;
var ostypes;
if (Services.appinfo.OS.toLowerCase() == 'darwin') { initOstypes() } // needed for `mac_method` of "carbon"
var gWkComm = new Comm.server.worker(PATH_LIB + 'MainWorker.js', null, null, onBeforeTerminateMainworker);
callInMainworker('reinitHotkeys', {
	prefs: {
		UseMkWin: require("sdk/simple-prefs").prefs.UseMkWin
	},
	register: false // we dont want to register it
});

var hotkeyWorker = null;
var pageWorkerManager = require("./pageWorkerManager");
var fellBackToFirefoxHotkeys = false;

function EmitEventToActivePageWorker(aKeyName) {
	console.error('in mainthread EmitEventToActivePageWorker, aKeyName:', aKeyName);
    pageWorkerManager.EmitEventToActivePageWorker({
        data: aKeyName
    });
}

function hotkeyRegistrationFailed(aArg) {
	var { hotkey, reason } = aArg;
	Services.prompt.alert(Services.wm.getMostRecentWindow('navigator:browser'), 'Media Keys - Hotkey Registration Failed', reason + ( !hotkey ? '' : '\n\n\nOffending Hotkey Combination: ' + (hotkey.desc || 'All requested combinations') ));
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

function onBeforeTerminateMainworker() {
	return new Promise(resolve =>
		callInMainworker( 'onBeforeTerminate', null, ()=>resolve() )
	);
}

var gHotkeysRegistered = 0; // 0 for not registerd, 1 for registering, 2 for registered
var RegisterHotkeys = function()
{

	if (gHotkeysRegistered) { return } // either registering or already registered

	gHotkeysRegistered = 1; // mark it registering
	callInMainworker('hotkeysRegister', null, function(failed) {
		if (failed) {
			gHotkeysRegistered = 0;
			hotkeyRegistrationFailed(failed);
		} else {
			gHotkeysRegistered = 2;
		}
	});

    // var system = require("sdk/system");
	//
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
	if (gHotkeysRegistered) {
		gHotkeysRegistered = 0; // no error checking yet in hotkeysUnregister for if fails on unregister, so just set this to unregistered
		callInMainworker('hotkeysUnregister');
	}
    // if (hotkeyWorker != null){
    //     hotkeyWorker.postMessage("detach");
    //     hotkeyWorker.removeEventListener("message", pageWorkerManager.EmitEventToActivePageWorker);
    //     hotkeyWorker = null;
    //     fellBackToFirefoxHotkeys = false;
    //     console.log("Unregistered hotkeys");
    // }
};

function initOstypes() {
	if (!ostypes) {
		if (typeof(ctypes) == 'undefined') {
			Cu.import('resource://gre/modules/ctypes.jsm');
		}

		Services.scriptloader.loadSubScript(PATH_LIB + 'ostypes/cutils.jsm'); // need to load cutils first as ostypes_mac uses it for HollowStructure
		Services.scriptloader.loadSubScript(PATH_LIB + 'ostypes/ctypes_math.jsm');
		switch (Services.appinfo.OS.toLowerCase()) {
			case 'winnt':
			case 'winmo':
			case 'wince':
					Services.scriptloader.loadSubScript(PATH_LIB + 'ostypes/ostypes_win.jsm');
				break;
			case 'darwin':
					Services.scriptloader.loadSubScript(PATH_LIB + 'ostypes/ostypes_mac.jsm');
				break;
			default:
				// assume xcb (*nix/bsd)
				Services.scriptloader.loadSubScript(PATH_LIB + 'ostypes/ostypes_x11.jsm');
		}
	}
}

function Destroy() {
	gWkComm.unregister(); // this will unregister the hotkeys if it is running, due to the onBeforeTerminateMainworker
	gWkComm = null;
	console.error('called and did destroy');
}

exports.Destroy = Destroy;
exports.RegisterHotkeys = RegisterHotkeys;
exports.UnregisterHotkeys = UnregisterHotkeys;
