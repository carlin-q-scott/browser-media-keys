/* import js-ctypes */
var {Cu} = require("chrome");
var {ctypes} = Cu.import("resource://gre/modules/ctypes.jsm", null);

var pageMod = require("sdk/page-mod");
var data = require("sdk/self").data;
var { viewFor } = require("sdk/view/core");
var workers = [];
var win32Api = ctypes.open("stdafx.dll");

//Use this to detach message worker when the media page is closed
function detachWorker(worker, workerArray) {
  var index = workerArray.indexOf(worker);
  if(index != -1) {
    workerArray.splice(index, 1);
  }
}

//attach content scripts to appropriate websites
pageMod.PageMod({
		include: "*.pandora.com",
		contentScriptFile: [data.url("Finder.js"), data.url("PandoraView.js"), data.url("PandoraOrchestrator.js")],
		onAttach: function(worker){
			workers.push(worker);
			worker.on('detach', function() {
				detachWorker(this, workers);
			});
		}
});
/*
var windows = require("sdk/windows").browserWindows;

//add media key event listener to all open windows
for (let window of windows) {
	AddMediaKeyEventListenerTo(window);
}
//add media key event listener to all future windows
windows.on("open", AddMediaKeyEventListenerTo);
*/
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
								
if(RegistHotKey(null, VK_MEDIA_PLAY_PAUSE, MOD_NONE, VK_MEDIA_PLAY_PAUSE)) alert("Hotkey Registered!");
var msg = new MSG;
while (GetMessage(msg, NULL, WM_KEYFIRST, WM_KEYLAST))
{
	if (msg.message == WM_HOTKEY)
	{
		EmitEventToWorkers({key: "MediaPlayPause"});			
	}
}
win32Api.close();

function EmitEventToWorkers(event){
	for (let worker of workers){
		//for some reason event is not an Event so I had to comment this out
		//worker.port.on(event.key, event.preventDefault);
		worker.port.emit(event.key);
	}
}

function AddMediaKeyEventListenerTo(window){
	viewFor(window).addEventListener("keydown", function (event) {
	  if (event.defaultPrevented) {
		return; // Should do nothing if the key event was already consumed.
	  }

	  if (event.key !== undefined) {
		// Handle the event with KeyboardEvent.key and set handled true.
		switch (event.key){
			case "MediaPlayPause":
			case "MediaNextTrack":
			case "MediaStop":
				EmitEventToWorkers(event);
				break;
		}
	  } else if (event.keyIdentifier !== undefined) {
		// Handle the event with KeyboardEvent.keyIdentifier and set handled true.
	  } else if (event.keyCode !== undefined) {
		if (event.keyCode == 0x13 || event.keyCode == 0x7E) {
			//pause_break key event
		  //use this to support other browsers since they cannot receive media key events
		}
	  }
	}, true);
}