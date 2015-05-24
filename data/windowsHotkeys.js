/* import js-ctypes */
var hotkeyListenerIntervalId;
var win32Api;

onmessage = function(event)
{
	switch (event.data)
	{
		case "attach":
			AttachEventListeners();
			break;
		case "detach":
			DetachEventListeners();
			break;
	}
};

var AttachEventListeners = function()
{
	//possible race condition if win32Api is not null
	win32Api = ctypes.open("user32.dll");
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
	var hotkeys = [
		VK_MEDIA_NEXT_TRACK,
		VK_MEDIA_PREV_TRACK,
		VK_MEDIA_STOP,
		VK_MEDIA_PLAY_PAUSE
	];
	for(let hotkey of hotkeys)
	{
		if(!RegisterHotKey(activeWindow, hotkey, MOD_NONE, hotkey)) console.log("Failed to register hotkey");
	}
	
	var msg = new MSG;
	hotkeyListenerIntervalId = setInterval(function()
	{
		while (PeekMessage(msg.address(), activeWindow, WM_HOTKEY, WM_HOTKEY, PM_REMOVE))
		{
			if (msg.wParam == VK_MEDIA_NEXT_TRACK)
			{
				postMessage("MediaNextTrack");			
			}
			else if (msg.wParam == VK_MEDIA_PREV_TRACK)
			{
				postMessage("MediaPreviousTrack");			
			}
			else if (msg.wParam == VK_MEDIA_STOP)
			{
				postMessage("MediaStop");			
			}
			else if (msg.wParam == VK_MEDIA_PLAY_PAUSE)
			{
				postMessage("MediaPlayPause");			
			}
		}
	}, 200);
};

var DetachEventListeners = function()
{
	clearInterval(hotkeyListenerIntervalId);
	win32Api.close();
    win32Api = null;
    console.log("closed win32 API");
};