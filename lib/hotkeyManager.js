var pageWorkers = [];
var activePageWorkerIndex = -1;
var hotkeyWorker = null;
var { setTimeout } = require("sdk/timers");

var RegisterHotkeys = function()
{
	var system = require("sdk/system");
	var aHotkeyWorker;
	
	switch (system.platform)
	{
		case "winnt":
			console.log("Registering global hotkeys");
			var {Cu} = require("chrome");
			var {ChromeWorker} = Cu.import("resource://gre/modules/Services.jsm", null);
			aHotkeyWorker = new ChromeWorker(require("sdk/self").data.url("windowsHotkeys.js"));
			aHotkeyWorker.addEventListener("message", EmitEventToActivePageWorker);
			break;
		default:
			console.log("Global hotkeys not supported for " + system.platform + ". Falling back to browser hotkeys");
			aHotkeyWorker = require("firefoxHotkeys");
			aHotkeyWorker.addEventListener(EmitEventToActivePageWorker);
	}
			
	aHotkeyWorker.postMessage("attach");
	return aHotkeyWorker;
};

var UnregisterHotkeys = function(){
    if (hotkeyWorker != null){
        hotkeyWorker.postMessage("detach");
        console.log("Unregistered hotkeys");
    }
};

var RegisterContentScripts = function(pageDomains)
{
	var pageMod = require("sdk/page-mod");
	var data = require("sdk/self").data;
	
	for(let pageDomain of pageDomains)
	{
		if (pageDomain == "youtube.com") contentScriptFiles = "./youtube.com-orchestrator.js";
		else contentScriptFiles = ["./Finder.js", "./" + pageDomain + "-view.js", "./orchestrator.js"];
		
		pageMod.PageMod(
		{
			include: "*." + pageDomain,
			contentScriptFile: contentScriptFiles,
			attachTo: ["top", "existing"],
			onAttach: AttachWorkerToPage
		});
	}
};

var AttachWorkerToPage = function(worker)
{
	pageWorkers.push(worker);
	activePageWorkerIndex = pageWorkers.indexOf(worker);

	worker.on('detach', function() {
		DetachPageWorker(this, pageWorkers); //might be worker rather than 'this'
	});
	worker.tab.on('activate', function(tab){
		ActivatePageWorker(worker);
	});
	
	if (hotkeyWorker == null) hotkeyWorker = RegisterHotkeys();
};

var ActivatePageWorker = function(worker)
{
	//only act if the array has more than one element
	if (activePageWorkerIndex > 0)
	{
		var indexOfWorker = pageWorkers.indexOf(worker);
		if (indexOfWorker != activePageWorkerIndex)
		{
			//console.log("switching from " + pageWorkers[activePageWorkerIndex].url + " to " + pageWorkers[indexOfWorker].url);
			pageWorkers.splice(indexOfWorker, 1);
			pageWorkers.push(worker);
		}
	}
};

//Use this to detach message worker when the media page is closed
var DetachPageWorker = function(worker, workerArray)
{
	var indexOfWorker = workerArray.indexOf(worker);
	if(indexOfWorker == -1) return;
	
	workerArray.splice(indexOfWorker, 1);
	activePageWorkerIndex = activePageWorkerIndex - 1;
	
	setTimeout(function(){
		if (activePageWorkerIndex == -1 && hotkeyWorker != null)
		{
			hotkeyWorker.postMessage("detach");
			hotkeyWorker.removeEventListener("message", EmitEventToActivePageWorker);
			hotkeyWorker = null;
		}
	}, 5000);
};

var EmitEventToActivePageWorker = function(event)
{
	//console.log("Sending " + event.data + " to " + pageWorkers[activePageWorkerIndex].tab.url);
	pageWorkers[activePageWorkerIndex].port.emit(event.data);
};

exports.RegisterHotkeys = RegisterHotkeys;
exports.UnregisterHotkeys = UnregisterHotkeys;
exports.RegisterContentScripts = RegisterContentScripts;
exports.EmitEventToActivePageWorker = EmitEventToActivePageWorker;