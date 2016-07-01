// Imports
importScripts('resource://jid1-4gp7z3tkud3tzg-at-jetpack/lib/comm/Comm.js');

// Globals
var core = {
	os: {
		name: OS.Constants.Sys.Name.toLowerCase()
	}
};

var gBsComm = new Comm.client.worker();
var callInManager = CommHelper.mainworker.callInBootstrap;

var gPollComm;
var callInPoller = Comm.callInX.bind(null, 'gPollComm', null);

var attached = false; // true when hotkeys are actively being watched

var win_stuff = {
	hotkeys: [
	    ostypes.CONST.VK_MEDIA_NEXT_TRACK,
	    ostypes.CONST.VK_MEDIA_PREV_TRACK,
	    ostypes.CONST.VK_MEDIA_STOP,
	    ostypes.CONST.VK_MEDIA_PLAY_PAUSE
	],
	hotkeys_registered: []
};

function init(aArg) {
	var { lib_path } = aArg;

	core.addon.path.lib = lib_path;

	importScripts('resource://jid1-4gp7z3tkud3tzg-at-jetpack/lib/ostypes/cutils.jsm');
	// importScripts('resource://jid1-4gp7z3tkud3tzg-at-jetpack/lib/ostypes/ctypes_math.jsm');

	switch (core.os.name) {
		case 'winnt':
				importScripts('resource://jid1-4gp7z3tkud3tzg-at-jetpack/lib/ostypes/ostypes_win.jsm');
			break;
		case 'darwin':
				importScripts('resource://jid1-4gp7z3tkud3tzg-at-jetpack/lib/ostypes/ostypes_mac.jsm');
			break;
		default:
			// assume unix/linux/solaris
			importScripts('resource://jid1-4gp7z3tkud3tzg-at-jetpack/lib/ostypes/ostypes_x11.jsm');
	}
}

self.onclose = function() {
	if (attached) {
		detach();
	}
	
	switch (core.os.name) {
		case 'winnt':

			break;
		case 'darwin':

			break;
		default:
			// assume unix/linux/solaris

	}
}

function attach(aArg) {
	var { UseMkWin } = aArg;

		if (!attached) {
		switch (core.os.name) {
			case 'winnt':

					if (!UseMkWin) {


						for (var hotkey of win_stuff.hotkeys) {
							var rez_reg = ostypes.API('RegisterHotKey')(null, 1, ostypes.CONST.MOD_NONE, hotkey);
							console.log('rez_reg:', rez_reg);

							if (!rez_reg){
								console.log("Failed to register hotkey: " + hotkey);
								detach();
								// throw "attach failed"; - dont throw, as attached is false, it will cause this function to return false, which will make hotkeyManager fallback to RegisterFirefoxHotkeys
							} else {
								attached = true; // set even when just one hotkey gets attached, otherwise detach() will not detach the ones that were succesfully attached
							}
						}

					} else {
						// TODO:
					}

				break;
			case 'darwin':

					gChildComm = new Comm.server.worker('resource://jid1-4gp7z3tkud3tzg-at-jetpack/lib/PollWorker.js');
					callInChildworker = Comm.callInX.bind(null, 'gChildComm', null);

				break;
			default:
				// assume unix/linux/solaris - XCB should work, but if we get an error return false so hotkeyManager.js will do `RegisterFirefoxHotkeys()` for local keys only
				try {

					attached =
				} catch(ex) {
					console.error('Error while trying to attach XCB:', ex);
					// probably got error due to xcb not being supported on this platform, so return false so hotkeyManager.js will do `RegisterFirefoxHotkeys()` for local keys only
				}
		}

		if (!attached) {
			// failed to attach
			// returning false will cause hotkeyManager to fallback to `RegisterFirefoxHotkeys()`
			return false;
		} else {
			// successfully attached
			return true;
		}
	} else {
		console.warn('hotkeys are already attached');
	}
}

function detach() {
	if (attached) {
		switch (core.os.name) {
			case 'winnt':
					for (var hotkey of win_stuff.hotkeys_registered) {
						var rez_unreg = ostypes.API('UnregisterHotKey')(null, hotkey);
						console.log('rez_unreg:', rez_unreg);
						if(!rez_unreg) {
							console.log("Failed to unregister hotkey: " + hotkey);
						}
					}
					win_stuff.hotkeys_registered = [];

					attached = false;
				break;
			case 'darwin':

				break;
			default:
				// assume unix/linux/solaris

		}
	}
}

function winRunFakeLoop() {
	if (!win_stuff.running_loop) {
		win_stuff.msg = ostypes.TYPE.MSG();
		win_stuff.running_loop = setInterval(winFakeLoop, 200);
	} else {
		console.warn('already running');
	}
}

function winFakeLoop() {
	while (ostypes.API('PeekMessage')(msg.address(), activeWindow, WM_HOTKEY, WM_HOTKEY, PM_REMOVE))
	{
		if (msg.wParam == VK_MEDIA_NEXT_TRACK)
		{
			callInManager("EmitEventToActivePageWorker", "MediaTrackNext");
		}
		else if (msg.wParam == VK_MEDIA_PREV_TRACK)
		{
			callInManager("EmitEventToActivePageWorker", "MediaTrackPrevious");
		}
		else if (msg.wParam == VK_MEDIA_STOP)
		{
			callInManager("EmitEventToActivePageWorker", "MediaStop");
		}
		else if (msg.wParam == VK_MEDIA_PLAY_PAUSE)
		{
			callInManager("EmitEventToActivePageWorker", "MediaPlayPause");
		}
	}
}

function winStopFakeLoop() {
	if (win_stuff.running_loop) {
		clearInterval(win_stuff.running_loop);
		delete win_stuff.msg;
	} else {
		console.warn('not running');
	}
}
