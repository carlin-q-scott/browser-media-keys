/**
 * MediaKeys namespace.
 */
var MediaKeys = (function(undefined)
{
	var supportedPageDomains = ["pandora.com", "tidalhifi.com"];
	var workers = [];

	var Init = function()
	{		
		//attach content scripts to appropriate websites
		RegisterContentScripts(supportedPageDomains);
		
		AttachEventListenerToEntireBrowser();
	}
	
	var RegisterContentScripts = function(pageDomains)
	{
		var pageMod = require("sdk/page-mod");
		var data = require("sdk/self").data;
		
		for(let pageDomain of pageDomains)
		{
			pageMod.PageMod(
			{
				include: "*." + pageDomain,
				contentScriptFile: [data.url("Finder.js"), data.url(pageDomain + "-view.js"), data.url(pageDomain + "-orchestrator.js")],
				onAttach: AttachWorkerToPage
			});
		}
	}
	
	var AttachWorkerToPage = function(worker)
	{
		workers.push(worker);
		worker.on('detach', function() {
			DetachWorker(this, workers);
		});
	}
	
	var AttachEventListenerToEntireBrowser = function()
	{
		var windows = require("sdk/windows").browserWindows;

		//add media key event listener to all open windows
		for (let window of windows) AddMediaKeyEventListenerTo(window);
		
		//add media key event listener to all future windows
		windows.on("open", AddMediaKeyEventListenerTo);
	}
	
	//Use this to detach message worker when the media page is closed
	var DetachWorker = function(worker, workerArray)
	{
		var index = workerArray.indexOf(worker);
		if(index != -1) workerArray.splice(index, 1);
	}

	var EmitEventToWorkers = function(event){
		for (let worker of workers)
		{
			//for some reason event is not an Event so I had to comment this out
			//worker.port.on(event.key, event.preventDefault);
			worker.port.emit(event.key);
		}
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
				case "MediaNextTrack":
				case "MediaPreviousTrack":
				case "MediaStop":
					EmitEventToWorkers(event);
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
	
	return { Init: Init	};
})();

MediaKeys.Init();