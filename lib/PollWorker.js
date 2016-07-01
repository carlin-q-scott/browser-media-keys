// Imports
importScripts('resource://jid1-4gp7z3tkud3tzg-at-jetpack/lib/comm/Comm.js');

// Globals
var core = {
	os: {
		name: OS.Constants.Sys.Name.toLowerCase()
	}
};
var gWkComm = new Comm.client.worker();
var { callInMainworker } = CommHelper.childworker;
var callInManager = Comm.callInX.bind(null, 'gWkComm', 'callInManager');

var mac_stuff = {
	runloop_ref: null,
	attached: false,
	runloop_mode: null,

	tapEventCallback: null,
	_eventPort: null,
	_eventPortSource: null
};
function init() {
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

	// OS Specific initialization
	switch (core.os.name) {
		case 'winnt':
				// nothing special
			break;
		case 'darwin':

				mac_stuff.runloop_ref = ostypes.API('CFRunLoopGetCurrent')();
				mac_stuff.runloop_mode = ostypes.HELPER.makeCFStr('com.mozilla.firefox.browsermediakeys');

				return {
					runloop_ref_strofptr: cutils.strOfPtr(mac_stuff.runloop_ref) // so MainWorker can interrupt/stop the infinite loop
				};

			break;
		default:
			// assume unix/linux/solaris
			// nothing special
	}
}

self.onclose = function() {
	switch (core.os.name) {
		case 'darwin':
				if (mac_stuff.attached) {
					// i really should never terminate the worker if it is attached. as if it is attached, very likely the macRunLoop is running, and if i terminate the worker while that is running it will crash firefox
					// so this should never happen, but for correctness i put this if block
					detach();
				}
				// do i have to release the mac_stuff.runloop_ref ??? // well worker is dying anyways, so no need i would think anyways
				// ostypes.API('CFRelease')(mac_stuff.runloop_mode); // i dont think i really have to do this, the worker is dying, so its getting released
			break;
	}
}

function attach() {
	switch (core.os.name) {
		case 'darwin':
				if (!mac_stuff.attached) {
					if (!mac_stuff.tapEventCallback) {
						var tapEventCallback_js = function(proxy, type, event, refcon) {

							if (cutils.jscEqual(type, ostypes.CONST.kCGEventTapDisabledByTimeout)) {
								console.error('RENABLING!!!!');
								ostypes.API('CGEventTapEnable')(mac_stuff._eventPort, true);
								return event;
							} else if (cutils.jscEqual(type, ostypes.CONST.kCGEventTapDisabledByUserInput)) {
								// Was disabled manually by -[pauseTapOnTapThread]
								console.error('this should never happen!!!! but return event so things work as my tap is non-passive');
								return event;
							}

							if (!cutils.jscEqual(type, ostypes.CONST.NX_SYSDEFINED)) {
								return event;
							} else {
								var NSEvent = ostypes.HELPER.class('NSEvent');
								var nsEvent = ostypes.API('objc_msgSend')(NSEvent, ostypes.HELPER.sel('eventWithCGEvent:'), event);

								var subtype = ostypes.API('objc_msgSend')(nsEvent, ostypes.HELPER.sel('subtype'));
								console.log('subtype:', subtype);
								subtype = cutils.jscGetDeepest(ctypes.cast(subtype, ostypes.TYPE.NSUInteger));
								console.log('casted subtype:', subtype);

								if (!cutils.jscEqual(subtype, 8)) {
									return event;
								} else {
									var data1 = ostypes.API('objc_msgSend')(nsEvent, ostypes.HELPER.sel('data1'));
									console.log('data1:', data1);
									data1 = cutils.jscGetDeepest(ctypes.cast(data1, ostypes.TYPE.NSUInteger));
									console.log('casted data1:', data1);

									var keyCode = data1 >>> 16;
									var keyRepeat = !!(data1 & 0x1);
									var keyUp = data1 & 0x0100;

									var hotkey_emit = {
										NX_KEYTYPE_NEXT: 'MediaTrackNext',
										NX_KEYTYPE_PREVIOUS: 'MediaTrackPrevious',
										// VK_MEDIA_STOP: 'MediaStop', // i dont think mac has a stop button
										NX_KEYTYPE_PLAY: 'MediaPlayPause'
										// NX_KEYTYPE_FAST: ''
										// NX_KEYTYPE_REWIND: ''
									};

									for (var hotkey in hotkey_emit) {
										if (cutils.jscEqual(ostypes.CONST[hotkey], keyCode)) {
											console.log('calling in manager for hotkey:', hotkey);
											callInManager("EmitEventToActivePageWorker", hotkey_emit[hotkey]);

											return null; // block the event, so like it doesnt interfere with iTunes
										}
									}

									return event;

									// if consume with return null should i do a [nsEvent retain]? as they do here - https://github.com/nevyn/SPMediaKeyTap/blob/master/SPMediaKeyTap.m#L228
								}
							}

							return event;
						};
						mac_stuff.tapEventCallback = ostypes.TYPE.CGEventTapCallBack(tapEventCallback_js);
					}

					// Add an event tap to intercept the system defined media key events
					mac_stuff._eventPort = ostypes.API('CGEventTapCreate')(ostypes.CONST.kCGSessionEventTap,
																		ostypes.CONST.kCGHeadInsertEventTap,
																		ostypes.CONST.kCGEventTapOptionDefault,
																		ostypes.API('CGEventMaskBit')(ostypes.CONST.NX_SYSDEFINED),
																		mac_stuff.tapEventCallback,
																		null);

					console.log('mac_stuff._eventPort:', mac_stuff._eventPort);

					mac_stuff._eventPortSource = ostypes.API('CFMachPortCreateRunLoopSource')(ostypes.CONST.kCFAllocatorSystemDefault, mac_stuff._eventPort, 0);
					console.log('mac_stuff._eventPortSource:', mac_stuff._eventPortSource);

					if (mac_stuff._eventPortSource.isNull()) {
						console.error('ERROR: Failed to get _eventPortSource as it is null!');
						mac_stuff._eventPortSource = null;
						// TODO: cleanup mac_stuff._eventPort

						// do nothing here, will return false as i dont set mac_stuff.attached to true, causing hotkeyManager to fallback to RegisterFirefoxHotkeys
					} else {
						ostypes.API('CFRunLoopAddSource')(mac_stuff.runloop_ref, mac_stuff._eventPortSource, mac_stuff.runloop_mode);
						console.log('did CFRunLoopAddSource');

						mac_stuff.attached = true;

						setTimeout(macRunLoop, 0); // setTimeout so i can return to MainWorker the true. otherwise this will get it into the infinite loop
					}

					if (mac_stuff.attached) {
						return true;
					} else {
						return false;
					}
				} else {
					console.warn('tap is already installed, so will not install again');
				}
			break;
	}
}

function detach() {
	switch (core.os.name) {
		case 'darwin':
				if (mac_stuff.attached) {

					ostypes.API('CFRunLoopSourceInvalidate')(mac_stuff._eventPortSource);
					console.log('invalidated _eventPortSource');
					ostypes.API('CFRelease')(mac_stuff._eventPortSource);
					console.log('released _eventPortSource');
					mac_stuff._eventPortSource = null;

					ostypes.API('CFRelease')(mac_stuff.tapEventCallback);
					console.log('released tapEventCallback');
					mac_stuff.tapEventCallback = null;


					mac_stuff.attached = false;
				} else {
					console.warn('no tap was installed, nothing to install');
				}
			break;
	}
}

function macRunLoop() {
	switch (core.os.name) {
		case 'darwin':
				if (!mac_stuff.running_loop) {
					mac_stuff.running_loop = true;
					while (true) {
						var rez_run = ostypes.API('CFRunLoopRunInMode')(mac_stuff.runloop_mode, 100000, false); // 2nd arg is seconds
						console.log('rez_run:', rez_run);

						if (cutils.jscEqual(rez_run, ostypes.CONST.kCFRunLoopRunStopped)) { // because when i stop it from MainWorker I use this constant
							mac_stuff.running_loop = false;
						}
					}
				} else {
					console.warn('loop is already running');
				}
			break;
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
