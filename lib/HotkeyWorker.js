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
		'VK_MEDIA_NEXT_TRACK',
		'VK_MEDIA_PREV_TRACK',
		'VK_MEDIA_STOP',
		'VK_MEDIA_PLAY_PAUSE'
	],
	hotkeys_registered: []
};

function init(aArg) {
	// var { lib_path } = aArg;

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
	console.error('in attach');
	var { UseMkWin } = aArg;

	if (!attached) {
		switch (core.os.name) {
			case 'winnt':

					if (!UseMkWin) {
						for (var hotkey of win_stuff.hotkeys) {
							var rez_reg = ostypes.API('RegisterHotKey')(null, ostypes.CONST[hotkey], ostypes.CONST.MOD_NONE, ostypes.CONST[hotkey]);
							console.log('rez_reg:', rez_reg);

							if (!rez_reg){
								console.error('Failed to register hotkey:', hotkey);
								detach();
								break;
								// throw "attach failed"; - dont throw, as attached is false, it will cause this function to return false, which will make hotkeyManager fallback to RegisterFirefoxHotkeys
							} else {
								win_stuff.hotkeys_registered.push(hotkey);
								attached = true; // set even when just one hotkey gets attached, otherwise detach() will not detach the ones that were succesfully attached
							}
						}

						if (attached) {
							winRunFakeLoop();
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

					// attached = true;
				} catch(ex) {
					console.error('Error while trying to attach XCB:', ex);
					// probably got error due to xcb not being supported on this platform, so return false so hotkeyManager.js will do `RegisterFirefoxHotkeys()` for local keys only
				}
		}

		console.error('out attach inner');
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
	console.error('out attach');
}

function detach() {
	console.error('in detach');
	if (attached) {
		switch (core.os.name) {
			case 'winnt':
					console.log('in inner detach');
					winStopFakeLoop();

					var l = win_stuff.hotkeys_registered.length;
					for (var i=0; i<l; i++) {
						var hotkey = win_stuff.hotkeys_registered[i];
						var rez_unreg = ostypes.API('UnregisterHotKey')(null, ostypes.CONST[hotkey]);
						console.log('rez_unreg:', rez_unreg);
						if(!rez_unreg) {
							console.error('Failed to unregister hotkey:', hotkey);
						} else {
							win_stuff.hotkeys_registered.splice(i, 1);
							i--;
							l--;
						}
					}

					attached = false; // not neccesarily true, if win_stuff.hotkeys_registered length is 0 then attached is false, but i set it to false here. only time is when UnregisterHotKey fails is when this is not true. // TODO: handle if unregister fails and what should i set attached to? leave it true?
				break;
			case 'darwin':

				break;
			default:
				// assume unix/linux/solaris

		}
	}
	console.error('out detach');
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
	// console.log('in winFakeLoop');
	while (ostypes.API('PeekMessage')(win_stuff.msg.address(), null, ostypes.CONST.WM_HOTKEY, ostypes.CONST.WM_HOTKEY, ostypes.CONST.PM_REMOVE)) {
		// console.log('in peek, msg:', win_stuff.msg);
		var hotkey_emit = {
			'VK_MEDIA_NEXT_TRACK': 'MediaTrackNext',
			'VK_MEDIA_PREV_TRACK': 'MediaTrackPrevious',
			'VK_MEDIA_STOP': 'MediaStop',
			'VK_MEDIA_PLAY_PAUSE': 'MediaPlayPause'
		};
		for (var hotkey in hotkey_emit) {
			if (cutils.jscEqual(ostypes.CONST[hotkey], win_stuff.msg.wParam)) {
				console.log('calling in manager for hotkey:', hotkey);
				callInManager("EmitEventToActivePageWorker", hotkey_emit[hotkey]);
				break;
			}
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
