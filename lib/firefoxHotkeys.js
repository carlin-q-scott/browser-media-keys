var EmitEvent;
	
	var AttachEventListeners = function(eventEmitter)
	{
		EmitEvent = eventEmitter;
		var windows = require("sdk/windows").browserWindows;

		//add media key event listener to all open windows
		for (let window of windows) AddMediaKeyEventListenerTo(window);
		
		//add media key event listener to all future windows
		windows.on("open", AddMediaKeyEventListenerTo);
	}

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
	}
	
	var { viewFor } = require("sdk/view/core");
	
	var AddMediaKeyEventListenerTo = function(window)
	{
		viewFor(window).addEventListener("keydown", KeyEventHandler, true);
	}
	exports.AttachEventListeners = AttachEventListeners;