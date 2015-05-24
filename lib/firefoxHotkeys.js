var EmitEvent;

var postMessage = function(message)
{
	switch (message)
	{
		case "attach":
			AttachEventListeners();
			break;
		case "detach":
			DetachEventListeners();
			break;
		default:
			console.log("Received invalid 'message': " + message);
	}
};

var addEventListener = function(eventHandler)
{
	EmitEvent = eventHandler;
};

var removeEventListener = function(eventHandler)
{
	EmitEvent = null;
};

var AttachEventListeners = function()
{	
	var windows = require("sdk/windows").browserWindows;

	//add media key event listener to all open windows
	for (let window of windows) AddMediaKeyEventListenerTo(window);
	
	//add media key event listener to all future windows
	windows.on("open", AddMediaKeyEventListenerTo);
};
	
var DetachEventListeners = function()
{
	var windows = require("sdk/windows").browserWindows;

	//remove media key event listener from all open windows
	for (let window of windows) RemoveMediaKeyEventListenerFrom(window);
	
	//remove media key event listener from all future windows
	windows.removeListener("open", AddMediaKeyEventListenerTo);
};

var KeyEventHandler = function(event) {
	if (event.defaultPrevented) 
	{
		return; // Should do nothing if the key event was already consumed.
	}

	if (event.key !== undefined)
	{
		// Handle the event with KeyboardEvent.key and set handled true.
		switch (event.key){
			case "MediaPlayPause":
			case "MediaPreviousTrack":
			case "MediaNextTrack":
			case "MediaStop":
				EmitEvent({data: event.key});
				break;
		}
	}
	else if (event.keyIdentifier !== undefined)
	{
		// Handle the event with KeyboardEvent.keyIdentifier and set handled true.
	}
	else if (event.keyCode !== undefined)
	{
		if (event.keyCode == 0x13 || event.keyCode == 0x7E)
		{
			//pause_break key event
			//use this to support other browsers since they cannot receive media key events
		}
	}
};

var AddMediaKeyEventListenerTo = function(window)
{
	var { viewFor } = require("sdk/view/core");
	viewFor(window).addEventListener("keydown", KeyEventHandler, true);
};
	
var RemoveMediaKeyEventListenerFrom = function(window)
{
	var { viewFor } = require("sdk/view/core");
	viewFor(window).removeEventListener("keydown", KeyEventHandler, true);
};

exports.postMessage = postMessage;
exports.addEventListener = addEventListener;
exports.removeEventListener = removeEventListener;
exports.KeyEventHandler = KeyEventHandler;