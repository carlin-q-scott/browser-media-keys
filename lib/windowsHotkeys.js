/* import js-ctypes */
var {Cu} = require("chrome");
var {ctypes} = Cu.import("resource://gre/modules/ctypes.jsm", null);
var win32Api = ctypes.open("user32.dll");
function AttachEventListeners(EmitEvent){
	var HWND = ctypes.uint32_t;
	var RegisterHotKey = win32Api.declare("RegisterHotKey",
											ctypes.winapi_abi,
											ctypes.bool,
											HWND,
											ctypes.int32_t,
											ctypes.uint32_t,
											ctypes.uint32_t
										);
	var VK_MEDIA_PLAY_PAUSE = 0xB3;
	var VK_MEDIA_NEXT_TRACK = 0xB0;
	var VK_MEDIA_PREV_TRACK = 0xB1;
	var VK_MEDIA_STOP = 0xB2;

	var MOD_NONE = 0x0000;

	var WPARAM = ctypes.int32_t;
	var LPARAM = ctypes.uint32_t;
	var DWORD = ctypes.uint32_t;
	var POINT = ctypes.StructType("POINT",
							ctypes.int32_t,
							ctypes.int32_t
						);
	var MSG = ctypes.StructType("MSG",
							HWND,
							ctypes.uint32_t,
							WPARAM,
							LPARAM,
							DWORD,
							POINT
						);
	var LPMSG = new ctypes.PointerType(MSG);
	var WM_KEYFIRST = 0x0100;
	var WM_KEYLAST = 0x0109;
	var WM_HOTKEY = 0x0312;
	var GetMessage = win32Api.declase("GetMessage",
										ctypes.winapi_abi,
										ctypes.bool,
										LPMSG,
										HWND,
										ctypes.uint32_t,
										ctypes.uint32_t
									);
									
	if(RegisterHotKey(null, VK_MEDIA_PLAY_PAUSE, MOD_NONE, VK_MEDIA_PLAY_PAUSE)) console.log("Windows hotkeys registered!");
	var msg = new MSG;
	while (GetMessage(msg, NULL, WM_KEYFIRST, WM_KEYLAST))
	{
		if (msg.message == WM_HOTKEY)
		{
			EmitEvent({key: "MediaPlayPause"});			
		}
	}
	win32Api.close();
}

exports.AttachEventListeners = AttachEventListeners;