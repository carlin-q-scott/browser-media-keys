// Globals
const PATH_LIB = 'resource://jid1-4gp7z3tkud3tzg-at-jetpack/lib/';
var core;

var gBsComm = new Comm.client.worker();

var OSStuff = {};

// Imports
// importScripts('resource://gre/modules/osfile.jsm');
importScripts(PATH_LIB + '/comm/Comm.js');
var {callInBootstrap, callInChildworker1} = CommHelper.mainworker;

function dummyForInstantInstantiate() {}
function init(aArg) {
	console.log('in worker init, aArg:', aArg');

	importScripts(PATH_LIB + 'jscSystemHotkey/shtkMainworkerSubscript.js');

	// Import ostypes
	importScripts(PATH_LIB + 'ostypes/cutils.jsm');
	importScripts(PATH_LIB + 'ostypes/ctypes_math.jsm');
	switch (core.os.mname) {
		case 'winnt':
		case 'winmo':
		case 'wince':
			importScripts(PATH_LIB + 'ostypes/ostypes_win.jsm');
			break;
		case 'gtk':
			importScripts(PATH_LIB + 'ostypes/ostypes_x11.jsm');
			break;
		case 'darwin':
			importScripts(PATH_LIB + 'ostypes/ostypes_mac.jsm');
			break;
		default:
			throw new Error('Operating system, "' + OS.Constants.Sys.Name + '" is not supported');
	}

	reinitHotkeys(true); // this does readFilestore

}

// Start - Addon Functionality

function onBeforeTerminate() {
	console.log('doing mainworker term proc');
	var promises_main = [];


	promises_main.push(hotkeysUnregister()); // this isnt really in use as im doing it on before term of worker

	// Comm.server.unregAll('worker'); // dont do this, as this will terminate but hotkeysUnregister is doing work over there. and no need for this because when this MainWorker is terminated it terminates all its children

	switch (core.os.mname) {
		case 'android':

				if (OSStuff.jenv) {
					JNI.UnloadClasses(OSStuff.jenv);
				}

			break;
		case 'gtk':

				ostypes.HELPER.ifOpenedXCBConnClose();

			break;
	}


	console.log('ok onBeforeTerminate return point');

	return Promise.all(promises_main);

}

var gHKI;
function reinitHotkeys(aRegister) {
	// aRegister is bool, if true it will register the hotkeys after done init
	// as need access to `core` and its properties

	// hotkeys MUST NOT be registered when this runs
	if (gHKI && gHKI.hotkeys && gHKI.hotkeys.find(el => el.__REGISTERED)) {
		console.error('deverror! cannot reinitHotkeys while hotkeys are active, first unregister it!');
		Promise.all([hotkeysUnregister()]).then(()=>{reinitHotkeys(true)});
		return;
	}

	if (!gHKI) { // as i do reinit
		gHKI = {
			jscsystemhotkey_module_path: PATH_LIB + 'jscSystemHotkey/',
		    loop_interval_ms: 200,
		    min_time_between_repeat: 400,
		    hotkeys: undefined,
		    callbacks: {
				triggerMediaTrackNext: () => callInBootstrap('EmitEventToActivePageWorker', 'MediaTrackNext'),
				triggerMediaTrackPrevious: () => callInBootstrap('EmitEventToActivePageWorker', 'MediaTrackPrevious'),
				triggerMediaStop: () => callInBootstrap('EmitEventToActivePageWorker', 'MediaStop'),
				triggerMediaPlayPause: () => callInBootstrap('EmitEventToActivePageWorker', 'MediaPlayPause')
		    }
		};
	}

	switch (core.os.mname) {
		case 'winnt':
				console.log('in init hotkeys');
				gHKI.hotkeys = [
					{
						desc: 'Media Key: Play/Pause', // it describes the `code` combo in english for use on hotkeysRegister() failing
						code: ostypes.CONST.VK_MEDIA_PLAY_PAUSE,
						callback: 'triggerMediaPlayPause',
					},
					{
						desc: 'Media Key: Previous',
						code: ostypes.CONST.VK_MEDIA_PREV_TRACK,
						callback: 'triggerMediaTrackPrevious',
					},
					{
						desc: 'Media Key: Stop',
						code: ostypes.CONST.VK_MEDIA_STOP,
						callback: 'triggerMediaStop',
					},
					{
						desc: 'Media Key: Next',
						code: ostypes.CONST.VK_MEDIA_NEXT_TRACK,
						callback: 'triggerMediaTrackNext',
					}
				];
				console.log('ok set');
			break;
		case 'gtk':
				gHKI.hotkeys = [
					{
						desc: 'Media Key: Play (Capslock:Off, Numlock:Off)',
						code: ostypes.CONST.XF86AudioPlay,
						callback: 'triggerMediaPlayPause',
					},
					{
						desc: 'Media Key: Previous (Capslock:Off, Numlock:Off)',
						code: ostypes.CONST.XF86AudioPrev,
						callback: 'triggerMediaTrackPrevious',
					},
					{
						desc: 'Media Key: Stop (Capslock:Off, Numlock:Off)',
						code: ostypes.CONST.XF86AudioStop,
						callback: 'triggerMediaStop',
					},
					{
						desc: 'Media Key: Next (Capslock:Off, Numlock:Off)',
						code: ostypes.CONST.XF86AudioNext,
						callback: 'triggerMediaTrackNext',
					},
					// with capslock on
					{
						desc: 'Media Key: Play (Capslock:On, Numlock:Off)',
						code: ostypes.CONST.XF86AudioPlay,
						mods: {
							capslock: true
						},
						callback: 'triggerMediaPlayPause',
					},
					{
						desc: 'Media Key: Previous (Capslock:On, Numlock:Off)',
						code: ostypes.CONST.XF86AudioPrev,
						mods: {
							capslock: true
						},
						callback: 'triggerMediaTrackPrevious',
					},
					{
						desc: 'Media Key: Stop (Capslock:On, Numlock:Off)',
						code: ostypes.CONST.XF86AudioStop,
						mods: {
							capslock: true
						},
						callback: 'triggerMediaStop',
					},
					{
						desc: 'Media Key: Next (Capslock:On, Numlock:Off)',
						code: ostypes.CONST.XF86AudioNext,
						mods: {
							capslock: true
						},
						callback: 'triggerMediaTrackNext',
					},
					// with numlock on
					{
						desc: 'Media Key: Play (Capslock:Off, Numlock:On)',
						code: ostypes.CONST.XF86AudioPlay,
						mods: {
							numlock: true
						},
						callback: 'triggerMediaPlayPause',
					},
					{
						desc: 'Media Key: Previous (Capslock:Off, Numlock:On)',
						code: ostypes.CONST.XF86AudioPrev,
						mods: {
							numlock: true
						},
						callback: 'triggerMediaTrackPrevious',
					},
					{
						desc: 'Media Key: Stop (Capslock:Off, Numlock:On)',
						code: ostypes.CONST.XF86AudioStop,
						mods: {
							numlock: true
						},
						callback: 'triggerMediaStop',
					},
					{
						desc: 'Media Key: Next (Capslock:Off, Numlock:On)',
						code: ostypes.CONST.XF86AudioNext,
						mods: {
							numlock: true
						},
						callback: 'triggerMediaTrackNext',
					},
					// with capslock and numlock on
					{
						desc: 'Media Key: Play (Capslock:On, Numlock:On)',
						code: ostypes.CONST.XF86AudioPlay,
						mods: {
							capslock: true,
							numlock: true
						},
						callback: 'triggerMediaPlayPause',
					},
					{
						desc: 'Media Key: Previous (Capslock:On, Numlock:On)',
						code: ostypes.CONST.XF86AudioPrev,
						mods: {
							capslock: true,
							numlock: true
						},
						callback: 'triggerMediaTrackPrevious',
					},
					{
						desc: 'Media Key: Stop (Capslock:On, Numlock:On)',
						code: ostypes.CONST.XF86AudioStop,
						mods: {
							capslock: true,
							numlock: true
						},
						callback: 'triggerMediaStop',
					},
					{
						desc: 'Media Key: Next (Capslock:On, Numlock:On)',
						code: ostypes.CONST.XF86AudioNext,
						mods: {
							capslock: true,
							numlock: true
						},
						callback: 'triggerMediaTrackNext',
					}
				];
			break;
		case 'darwin':
				gHKI.hotkeys = [
					{
						desc: 'Media Key: Play',
						code: ostypes.CONST.NX_KEYTYPE_PLAY,
						callback: 'triggerMediaPlayPause',
						mac_method: 'corefoundation'
					},
					{
						desc: 'Media Key: Previous',
						code: ostypes.CONST.NX_KEYTYPE_PREVIOUS,
						callback: 'triggerMediaTrackPrevious',
						mac_method: 'corefoundation'
					},
					{
						desc: 'F6',
						code: ostypes.CONST.kVK_F6, // mac doesnt have a stop media key, but the the PREVIOUS key is F7 and F6 has nothing on it, so I used F6 for STOP - http://xahlee.info/kbd/i/kb/Apple_iMac_Keyboard_A1242.jpg
						callback: 'triggerMediaStop',
						mac_method: 'carbon'
					},
					{
						desc: 'Media Key: Next',
						code: ostypes.CONST.NX_KEYTYPE_NEXT,
						callback: 'triggerMediaTrackNext',
						mac_method: 'corefoundation'
					}
				];
			break;
		default:
			console.error('your os is not supported for global platform hotkey');
			// throw new Error('your os is not supported for global platform hotkey');
	}
	console.log('done init hotkeys');

	if (aRegister) {
		hotkeysRegister().then(failed => !failed ? null : callInBootstrap('hotkeyRegistrationFailed', failed));
	}
}
