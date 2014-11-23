/* import js-ctypes */
//var {Cu} = require("chrome");
//var {ctypes} = Cu.import("resource://gre/modules/ctypes.jsm", null);

onmessage = function(event)
{
var win32Api = ctypes.open("user32.dll");

var HWND = ctypes.voidptr_t;
	var RegisterHotKey = win32Api.declare
	(
		"RegisterHotKey",
		ctypes.winapi_abi,
		ctypes.bool,
		HWND,
		ctypes.int32_t,
		ctypes.uint32_t,
		ctypes.uint32_t
	);

	var WPARAM = ctypes.uintptr_t;//long pointer
	var LPARAM = ctypes.intptr_t;//uint pointer
	var DWORD = ctypes.uint32_t;//long int
	var POINT = ctypes.StructType
	(
		"POINT",
		[
			{"x": ctypes.int32_t},
			{"y": ctypes.int32_t}
		]
	);
	var MSG = ctypes.StructType
	(
		"MSG",
		[
			{"hwnd": HWND},
			{"message": ctypes.uint32_t},
			{"wParam": WPARAM},
			{"lParam": LPARAM},
			{"time": DWORD},
			{"pt": POINT}
		]
	);
	var LPMSG = new ctypes.PointerType(MSG);
	var PeekMessage = win32Api.declare
	(
		"PeekMessageW",
		ctypes.winapi_abi,
		ctypes.bool,
		LPMSG,
		HWND,
		ctypes.uint32_t,
		ctypes.uint32_t,
		ctypes.uint32_t
	);
	var GetMessage = win32Api.declare
	(
		"GetMessageW",
		ctypes.winapi_abi,
		ctypes.bool,
		LPMSG,
		HWND,
		ctypes.uint32_t,
		ctypes.uint32_t
	);
	var GetActiveWindow = win32Api.declare
	(
		"GetActiveWindow",
		ctypes.winapi_abi,
		HWND
	);
	
	var PM_REMOVE = 0x0001;
	
	var WM_KEYFIRST = 0x0100;
	var WM_KEYLAST = 0x0109;
	var WM_HOTKEY = 0x0312;
	
	var VK_MEDIA_NEXT_TRACK = 0xB0;
	var VK_MEDIA_PREV_TRACK = 0xB1;
	var VK_MEDIA_STOP = 0xB2;
	var VK_MEDIA_PLAY_PAUSE = 0xB3;
	
	var MOD_NONE = 0x0000;
	
	var activeWindow = null;
	if(RegisterHotKey(activeWindow, VK_MEDIA_PLAY_PAUSE, MOD_NONE, VK_MEDIA_PLAY_PAUSE)) console.log("Play/Pause hotkey registered!");
	else console.log("Failed to register hotkey");
	
	var msg = new MSG;
	setInterval(function()
	{
		if (PeekMessage(msg.address(), activeWindow, WM_HOTKEY, WM_HOTKEY, PM_REMOVE))
		//if (GetMessage(msg.address(), activeWindow, WM_HOTKEY, WM_HOTKEY))
		{
			if (msg.wParam == VK_MEDIA_PLAY_PAUSE)
			{
				console.log("Play/Pause pressed");
				postMessage("MediaPlayPause");			
			}
			else console.log("message = " + msg.wParam);
		}
	}, 200);
}