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
	hotkeys_registered: [],
	running_loop: null,
	msg: null
};

var nix_stuff = {
	running_loop: null,
	keycodesArr: null,
	grabWins: null,
	hotkeyLastTriggered: 0
};

var mac_stuff = {
	runloop_ref: null,
	running_loop: null
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

	if (gPollComm) {
		gPollComm.unregister();
	}

	switch (core.os.name) {
		case 'winnt':

			break;
		case 'darwin':

			break;
		default:
			// assume unix/linux/solaris
			ostypes.HELPER.ifOpenedXCBConnClose();
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
							runFakeLoop();
						}

					} else {
						// TODO:
					}

				break;
			case 'darwin':

					if (!gPollComm) {
						gPollComm = new Comm.server.worker('resource://jid1-4gp7z3tkud3tzg-at-jetpack/lib/PollWorker.js', undefined, function(aArg) {
							console.log('ok back in MainWorker in onAfterInit, aArg:', aArg);
							var { runloop_ref_strofptr } = aArg;
							mac_stuff.runloop_ref = ostypes.TYPE.CFRunLoopRef(ctypes.UInt64(runloop_ref_strofptr));
						});
					}

					var deferred_attach = new Deferred();
					callInPoller('attach', undefined, function(aSuccess) {
						// aSuccess will be true/false. if false, then this will resolve this scopes attach with false, which will make hotkeyManager fallback to RegisterFirefoxHotkeys
						if (aSuccess) {
							attached = true;
							mac_stuff.running_loop = true;
						}
						deferred_attach.resolve(aSuccess);
					});
					return deferred_attach.promise;


				break;
			default:
				// assume unix/linux/solaris - XCB should work, but if we get an error return false so hotkeyManager.js will do `RegisterFirefoxHotkeys()` for local keys only
				try {

					var keysyms = ostypes.API('xcb_key_symbols_alloc')(ostypes.HELPER.cachedXCBConn());
					console.log('keysyms:', keysyms.toString());

					var XK_a = 0x0041; // lower case "a" // https://github.com/semonalbertyeah/noVNC_custom/blob/60daa01208a7e25712d17f67282497626de5704d/include/keysym.js#L216
					var XK_Print = 0xff61;
					var XK_Space = 0x0020;
					var XF86AudioPlay = 0x1008ff14; // untested and unverified. haven't even verified this with multiple sources yet jul 1 2016
					var XF86AudioNext = 0x1008ff17; // untested and unverified. haven't even verified this with multiple sources yet jul 1 2016
					var XF86AudioPrev = 0x1008ff16; // untested and unverified. haven't even verified this with multiple sources yet jul 1 2016
					var XF86AudioStop = 0x1008ff15; // untested and unverified. haven't even verified this with multiple sources yet jul 1 2016

					// var XCB_EVENT_MASK_KEY_PRESS = 1;
					// var XCB_EVENT_MASK_BUTTON_PRESS = 4;
					// var XCB_EVENT_MASK_EXPOSURE = 32768;
					// var XCB_CW_EVENT_MASK = 2048;

					var keycodesPtr = ostypes.API('xcb_key_symbols_get_keycode')(keysyms, XF86AudioPlay);
					console.log('keycodesPtr:', keycodesPtr.toString());

					var keycodesArr = [];
					for (var i=0; i<10; i++) { // im just thinking 10 is a lot, usually you only have 1 keycode. mayyybe 2. 10 should cover it
						var keycodesArrC = ctypes.cast(keycodesPtr, ostypes.TYPE.xcb_keycode_t.array(i+1).ptr).contents;
						console.log('keycodesArrC:', keycodesArrC);
						if (keycodesArrC[i] == ostypes.CONST.XCB_NO_SYMBOL) {
							break;
						}
						keycodesArr.push(keycodesArrC[i]);
					}

					console.log('keycodesArr:', keycodesArr);
					if (!keycodesArr.length) {
						// return 'linux no keycodes found';
						throw new Error('linux no keycodes found');
					}

					ostypes.API('free')(keycodesPtr);

					ostypes.API('xcb_key_symbols_free')(keysyms);

					var setup = ostypes.API('xcb_get_setup')(ostypes.HELPER.cachedXCBConn());
					console.log('setup:', setup.contents);

					var screens = ostypes.API('xcb_setup_roots_iterator')(setup);

					var grabWins = []; // so iterate through these and ungrab on remove of hotkey
					var screensCnt = screens.rem;
					console.log('screensCnt:', screensCnt);

					for (var i=0; i<screensCnt; i++) {
						console.log('screen[' + i + ']:', screens);
						console.log('screen[' + i + '].data:', screens.data.contents);
						for (var j=0; j<keycodesArr.length; j++) {
							// var rez_grab = ostypes.API('xcb_grab_key')(ostypes.HELPER.cachedXCBConn(), 1, screens.data.contents.root, ostypes.CONST.XCB_NONE, keycodesArr[j], ostypes.CONST.XCB_GRAB_MODE_ASYNC, ostypes.CONST.XCB_GRAB_MODE_ASYNC);
							var rez_grab = ostypes.API('xcb_grab_key_checked')(ostypes.HELPER.cachedXCBConn(), 1, screens.data.contents.root, ostypes.CONST.XCB_NONE, keycodesArr[j], ostypes.CONST.XCB_GRAB_MODE_ASYNC, ostypes.CONST.XCB_GRAB_MODE_ASYNC);
							console.log('rez_grab:', rez_grab);

							var rez_check = ostypes.API('xcb_request_check')(ostypes.HELPER.cachedXCBConn(), rez_grab);
							console.log('rez_check:', rez_check.toString());
							if (!rez_check.isNull()) {
								// console.error('grab failed! error:', rez_check.contents);
								console.error('The hotkey is already in use by another application. Find that app, and make it release this hotkey. Possibly could be in use by the "Global Keyboard Shortcuts" of the system, if so go there and remove it.'); // http://i.imgur.com/cLz1fDs.png
								// TODO: actually error handle this, in my test it seems there are 3 codes for XF86AudioPlay of keycodesArr: Array [ 172, 208, 215 ] and it seems 172 is attaching, but 208 and 215 are cuasing error. - http://i.imgur.com/bdpslBg.png - jul 1, 2016
								// throw new Error('The hotkey "PrntScrn" is already in use by another function. Please go to your system control panel and find the "Global Keyboard Shortcuts" section. Then disable whatever shortcut is using "PrntScrn" as a hotkey. Then come back to Firefox, go to NativeShot options page, and toggle the "System Hotkey" setting to "Off" then back to "On".');
							} else {
								ostypes.API('xcb_grab_key')(ostypes.HELPER.cachedXCBConn(), 1, screens.data.contents.root, ostypes.CONST.XCB_MOD_MASK_LOCK, keycodesArr[j], ostypes.CONST.XCB_GRAB_MODE_ASYNC, ostypes.CONST.XCB_GRAB_MODE_ASYNC); // caps lock
								ostypes.API('xcb_grab_key')(ostypes.HELPER.cachedXCBConn(), 1, screens.data.contents.root, ostypes.CONST.XCB_MOD_MASK_2, keycodesArr[j], ostypes.CONST.XCB_GRAB_MODE_ASYNC, ostypes.CONST.XCB_GRAB_MODE_ASYNC); // num lock
								ostypes.API('xcb_grab_key')(ostypes.HELPER.cachedXCBConn(), 1, screens.data.contents.root, ostypes.CONST.XCB_MOD_MASK_LOCK | ostypes.CONST.XCB_MOD_MASK_2, keycodesArr[j], ostypes.CONST.XCB_GRAB_MODE_ASYNC, ostypes.CONST.XCB_GRAB_MODE_ASYNC); // caps lock AND num lock
							}
						}

						// var chgValueList = ctypes.uint32_t.array()([
						//  XCB_EVENT_MASK_EXPOSURE | XCB_EVENT_MASK_BUTTON_PRESS | XCB_EVENT_MASK_KEY_PRESS
						// ]);
						// var rez_chg = xcb_change_window_attributes(ostypes.HELPER.cachedXCBConn(), screens.data.contents.root, XCB_CW_EVENT_MASK, chgValueList);
						// console.log('rez_chg:', rez_chg);

						grabWins.push(screens.data.contents.root);
						ostypes.API('xcb_screen_next')(screens.address());
					}

					var rez_flush = ostypes.API('xcb_flush')(ostypes.HELPER.cachedXCBConn());
					console.log('rez_flush:', rez_flush);

					nix_stuff.keycodesArr = keycodesArr;
					nix_stuff.grabWins = grabWins;

					attached = true;

					runFakeLoop();

				} catch(ex) {
					console.error('Error while trying to attach XCB:', ex);
					// probably got error due to xcb not being supported on this platform, so return false so hotkeyManager.js will do `RegisterFirefoxHotkeys()` for local keys only
					// dont do antyhing, as we dont set attached to true, it will make this whole function return false
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
					stopFakeLoop();

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

					// stop the infinite loop
					ostypes.API('CFRunLoopStop')(mac_stuff.runloop_ref);
					mac_stuff.running_loop = false; // premptive prediction that it stopped, i can actually test it by pinging a dumy function in PollWorker and waiting for its callback to return

					callInPoller('detach', undefined, function(aSuccess) {
						if (aSuccess) {
							attached = false;
						}
					});

				break;
			default:
				// assume unix/linux/solaris
				for (var i=0; i<nix_stuff.grabWins.length; i++) {
					console.log('ungrabbing win i:', i, nix_stuff.grabWins[i]);
					for (var j=0; j<nix_stuff.keycodesArr.length; j++) {
						console.log('ungrabbing key:', j, nix_stuff.keycodesArr[j])
						var rez_ungrab = ostypes.API('xcb_ungrab_key')(nix_stuff.conn, nix_stuff.keycodesArr[j], nix_stuff.grabWins[i], ostypes.CONST.XCB_NONE);
						console.log('rez_ungrab:', rez_ungrab);

						ostypes.API('xcb_ungrab_key')(nix_stuff.conn, nix_stuff.keycodesArr[j], nix_stuff.grabWins[i], ostypes.CONST.XCB_MOD_MASK_LOCK); // caps lock
						ostypes.API('xcb_ungrab_key')(nix_stuff.conn, nix_stuff.keycodesArr[j], nix_stuff.grabWins[i], ostypes.CONST.XCB_MOD_MASK_2); // num lock
						ostypes.API('xcb_ungrab_key')(nix_stuff.conn, nix_stuff.keycodesArr[j], nix_stuff.grabWins[i], ostypes.CONST.XCB_MOD_MASK_LOCK | ostypes.CONST.XCB_MOD_MASK_2); // caps lock AND num lock
					}

					var rez_flush = ostypes.API('xcb_flush')(nix_stuff.conn);
					console.log('rez_flush:', rez_flush);

					nix_stuff.keycodesArr = null;
					nix_stuff.grabWins = null;
					nix_stuff.hotkeyLastTriggered = 0;
		}
	}
	console.error('out detach');
}

function runFakeLoop() {
	switch (core.os.name) {
		case 'winnt':
				if (win_stuff.running_loop === null) {
					win_stuff.msg = ostypes.TYPE.MSG();
					win_stuff.running_loop = setInterval(fakeLoop, 200);
				} else {
					console.warn('already running');
				}
			break;
		case 'darwin':
				throw new Error('darwin not supported for fake loop - use real loop');
			break;
		default:
			// assume unix/linux/solaris
			if (nix_stuff.running_loop === null) {
				nix_stuff.running_loop = setInterval(fakeLoop, 200);
			} else {
				console.warn('already running');
			}
	}
}

function fakeLoop() {
	// console.log('in fakeLoop');
	switch (core.os.name) {
		case 'winnt':
				while (ostypes.API('PeekMessage')(win_stuff.msg.address(), null, ostypes.CONST.WM_HOTKEY, ostypes.CONST.WM_HOTKEY, ostypes.CONST.PM_REMOVE)) {
					// console.log('in peek, msg:', win_stuff.msg);
					var hotkey_emit = {
						VK_MEDIA_NEXT_TRACK: 'MediaTrackNext',
						VK_MEDIA_PREV_TRACK: 'MediaTrackPrevious',
						VK_MEDIA_STOP: 'MediaStop',
						VK_MEDIA_PLAY_PAUSE: 'MediaPlayPause'
					};
					for (var hotkey in hotkey_emit) {
						if (cutils.jscEqual(ostypes.CONST[hotkey], win_stuff.msg.wParam)) {
							console.log('calling in manager for hotkey:', hotkey);
							callInManager("EmitEventToActivePageWorker", hotkey_emit[hotkey]);
							break;
						}
					}
				}
			break;
		case 'darwin':
				throw new Error('darwin not supported for fake loop - use real loop');
			break;
		default:
			// assume unix/linux/solaris
			var evt = ostypes.API('xcb_poll_for_event')(ostypes.HELPER.cachedXCBConn());
			// console.log('evt:', evt);
			if (!evt.isNull()) {
				console.error('evt.contents:', evt.contents);
				for (var i=0; i<nix_stuff.keycodesArr.length; i++) {
					if (evt.contents.response_type == ostypes.CONST.XCB_KEY_PRESS) {
						if (evt.contents.pad0 == nix_stuff.keycodesArr[i]) {
							console.error('hotkey pressed! evt.pad0:', evt.contents.pad0, 'keycodesArr:', nix_stuff.keycodesArr);
							var hotkeyNowTriggered = Date.now();
							if (hotkeyNowTriggered - nix_stuff.hotkeyLastTriggered > 1000) {
								nix_stuff.hotkeyLastTriggered = hotkeyNowTriggered;
								callInManager("EmitEventToActivePageWorker", "MediaPlayPause");
							}
							else { console.warn('will not takeShot as 1sec has not yet elapsed since last triggering hotkey'); }
							break;
						}
					}
				}
				ostypes.API('free')(evt);
			}
	}
}

function stopFakeLoop() {
	switch (core.os.name) {
		case 'winnt':
				if (win_stuff.running_loop !== null) {
					clearInterval(win_stuff.running_loop);
					win_stuff.running_loop = null;
					win_stuff.msg = null;
				} else {
					console.warn('not running');
				}
			break;
		case 'darwin':
				throw new Error('darwin not supported for fake loop - use real loop');
			break;
		default:
			// assume unix/linux/solaris
			if (nix_stuff.running_loop !== null) {
				clearInterval(nix_stuff.running_loop);
				nix_stuff.running_loop = null;
			} else {
				console.warn('not running');
			}
	}
}

// start - common helper functions
function Deferred() {
	this.resolve = null;
	this.reject = null;
	this.promise = new Promise(function(resolve, reject) {
		this.resolve = resolve;
		this.reject = reject;
	}.bind(this));
	Object.freeze(this);
}
function genericReject(aPromiseName, aPromiseToReject, aReason) {
	var rejObj = {
		name: aPromiseName,
		aReason: aReason
	};
	console.error('Rejected - ' + aPromiseName + ' - ', rejObj);
	if (aPromiseToReject) {
		aPromiseToReject.reject(rejObj);
	}
}
function genericCatch(aPromiseName, aPromiseToReject, aCaught) {
	var rejObj = {
		name: aPromiseName,
		aCaught: aCaught
	};
	console.error('Caught - ' + aPromiseName + ' - ', rejObj);
	if (aPromiseToReject) {
		aPromiseToReject.reject(rejObj);
	}
}
