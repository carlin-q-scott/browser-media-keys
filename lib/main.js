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
		
		var AttachEventListeners;
		var system = require("sdk/system");
		switch (system.platform)
		{
			case "winnt":
				var {Cu} = require("chrome");
				var {ChromeWorker} = Cu.import("resource://gre/modules/Services.jsm", null);
				var hotkeyWorker = new ChromeWorker(require("sdk/self").data.url("windowsHotkeys.js"));
				hotkeyWorker.addEventListener("message", EmitEventToWorkers);
				hotkeyWorker.postMessage("");
				break;
			default:
				console.log("Global hotkeys not supported for " + system.platform + ". Falling back to browser hotkeys");
				require("./firefoxHotkeys.js").AttachEventListeners(EmitEventToWorkers);
		}
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
	
	//Use this to detach message worker when the media page is closed
	var DetachWorker = function(worker, workerArray)
	{
		var index = workerArray.indexOf(worker);
		if(index != -1) workerArray.splice(index, 1);
	}

	var EmitEventToWorkers = function(event){
		console.log(event.data + " pressed");
		for (let worker of workers)
		{
			//for some reason event is not an Event so I had to comment this out
			//worker.port.on(event.key, event.preventDefault);
			worker.port.emit(event.data);
		}
	}
	
	return { Init: Init	};
})();

MediaKeys.Init();