var pageWorkers = [];
var activePageWorkerIndex = -1;
var hotkeyWorker = null;
var { setTimeout } = require("sdk/timers");

var RegisterFirefoxHotkeys = function () {
	hotkeyWorker = require("./firefoxHotkeys");
	hotkeyWorker.addEventListener(EmitEventToActivePageWorker);
	hotkeyWorker.postMessage("attach");
};

var RegisterHotkeys = function()
{
	var system = require("sdk/system");

	switch (system.platform)
	{
		case "winnt":
			console.log("Registering global hotkeys");
			var {Cu} = require("chrome");
			var {ChromeWorker} = Cu.import("resource://gre/modules/Services.jsm", null);
			hotkeyWorker = new ChromeWorker(require("sdk/self").data.url("windowsHotkeys.js"));
			hotkeyWorker.addEventListener("message", EmitEventToActivePageWorker);
			hotkeyWorker.postMessage("attach");
			break;
		case "linux":
			console.log("Registering DBus hotkeys");
			hotkeyWorker = require("./linuxDBusHotkeys");
			hotkeyWorker.addEventListener(EmitEventToActivePageWorker);
			if (hotkeyWorker.gLibsExist) {
				hotkeyWorker.postMessage("attach");
				break;
 			} else {
				console.log("DBus not supported. glib, gobject and gio libaries are required.");
 			}
		default:
			console.log("Global hotkeys not supported for " + system.platform + ". Falling back to browser hotkeys");
			RegisterFirefoxHotkeys();
	}

};

var UnregisterHotkeys = function(){
    if (hotkeyWorker != null){
        hotkeyWorker.postMessage("detach");
        //delete hotkeyWorker;
        console.log("Unregistered hotkeys");
    }
};

var RegisterPageMods = function()
{
    var pageMod = require("sdk/page-mod");
    var preferences = require("sdk/simple-prefs");
    var { data } = require("sdk/self");
	var pageModSpecs = JSON.parse(data.load("pageMods.json"));

	for(let pageModSpec of pageModSpecs)
    {
		var prefName;
        if (typeof pageModSpec.contentScriptFile === "undefined")
            pageModSpec.contentScriptFile = ["./Finder.js", "./" + pageModSpec.name + "-view.js", "./orchestrator.js"];
        if (typeof pageModSpec.attachTo === "undefined")
            pageModSpec.attachTo = ["top", "frame", "existing"];
        if (pageModSpec.include.startsWith("@"))
        {
            prefName = pageModSpec.include.substr(1);
            pageModSpec.include = preferences.prefs[prefName].split(" ");
        }
        pageModSpec.onAttach = AttachWorkerToPage;

        var mod = pageMod.PageMod(pageModSpec);
	}
};

var AttachWorkerToPage = function(worker)
{
	pageWorkers.push(worker);
	activePageWorkerIndex = pageWorkers.indexOf(worker);

	worker.port.on('detach', function() {
		DetachPageWorker(worker, pageWorkers);
	});
	worker.tab.on('activate', function(){
		var system = require("sdk/system");
		if (system.platform === "linux" && hotkeyWorker && hotkeyWorker.gLibsExist) {
			hotkeyWorker.postMessage('reattach');
		}
		ActivatePageWorker(worker);
	});

	if (hotkeyWorker == null) RegisterHotkeys();
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
	activePageWorkerIndex--;

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
	if (event.data == "attach failed") RegisterFirefoxHotkeys();
	//console.log("Sending " + event.data + " to " + pageWorkers[activePageWorkerIndex].tab.url);
	pageWorkers[activePageWorkerIndex].port.emit(event.data);
};

exports.RegisterHotkeys = RegisterHotkeys;
exports.UnregisterHotkeys = UnregisterHotkeys;
exports.RegisterContentScripts = RegisterPageMods;
exports.EmitEventToActivePageWorker = EmitEventToActivePageWorker;
