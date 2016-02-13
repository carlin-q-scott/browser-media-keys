/* import js-ctypes */
var hotkeyListenerIntervalId;
var win32Api;
var activeWindow = null;

const HWND = ctypes.voidptr_t;

const PM_REMOVE = 0x0001;

const WM_KEYFIRST = 0x0100;
const WM_KEYLAST = 0x0109;
const WM_HOTKEY = 0x0312;

const VK_MEDIA_NEXT_TRACK = 0xB0;
const VK_MEDIA_PREV_TRACK = 0xB1;
const VK_MEDIA_STOP = 0xB2;
const VK_MEDIA_PLAY_PAUSE = 0xB3;

const MOD_NONE = 0x0000;

const hotkeys = [
    VK_MEDIA_NEXT_TRACK,
    VK_MEDIA_PREV_TRACK,
    VK_MEDIA_STOP,
    VK_MEDIA_PLAY_PAUSE
];

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
	for(let hotkey of hotkeys)
	{
		if(!RegisterHotKey(activeWindow, hotkey, MOD_NONE, hotkey)){
			console.log("Failed to register hotkey: " + hotkey);
			DetachEventListeners();
			throw "attach failed";
		}
	}
	
	var msg = new MSG;
	hotkeyListenerIntervalId = setInterval(function()
	{
		while (PeekMessage(msg.address(), activeWindow, WM_HOTKEY, WM_HOTKEY, PM_REMOVE))
		{
			if (msg.wParam == VK_MEDIA_NEXT_TRACK)
			{
				postMessage("MediaTrackNext");
			}
			else if (msg.wParam == VK_MEDIA_PREV_TRACK)
			{
				postMessage("MediaTrackPrevious");
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
    unRegisterHotkeys();
	clearInterval(hotkeyListenerIntervalId);
	win32Api.close();
    win32Api = null;
    console.log("closed win32 API");
};

function unRegisterHotkeys(){
    var UnregisterHotKey = win32Api.declare
    (
        "UnregisterHotKey",
        ctypes.winapi_abi,
        ctypes.bool,
        HWND,
        ctypes.int32_t
    );

    //unregister hotkeys
    for(let hotkey of hotkeys)
    {
        if(!UnregisterHotKey(activeWindow, hotkey)) console.log("Failed to unregister hotkey: " + hotkey);
    }
}