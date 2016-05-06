/**
 * Created by Carlin on 2/7/2016.
 */
var pageWorkers = [];
var { setTimeout } = require("sdk/timers");
var hotkeyManager = require("./hotkeyManager");
var { prefs } = require("sdk/simple-prefs");

var RegisterPageMods = function()
{
    var pageMod = require("sdk/page-mod");
    var { data } = require("sdk/self");
    var pageModSpecs = JSON.parse(data.load("pageMods.json"));

    for(let pageModSpec of pageModSpecs)
    {
        var prefName;
        if (typeof pageModSpec.contentScriptFile === "undefined")
            pageModSpec.contentScriptFile = ["./Finder.js", "./" + pageModSpec.name + "-view.js", "./orchestrator.js"];
        if (typeof pageModSpec.attachTo === "undefined")
            pageModSpec.attachTo = ["top", "existing"];
        if (pageModSpec.include.startsWith("@"))
        {
            prefName = pageModSpec.include.substr(1);
            pageModSpec.include = prefs[prefName].split(" ");
        }
        if (pageModSpec.contentScriptOptions !== undefined && pageModSpec.contentScriptOptions.pageScriptFile !== undefined)
            pageModSpec.contentScriptOptions.pageScriptFile = data.url(pageModSpec.contentScriptOptions.pageScriptFile);
        pageModSpec.onAttach = AttachWorkerToPage;

        pageMod.PageMod(pageModSpec);
    }
};

var AttachWorkerToPage = function(worker)
{
    if (pageWorkers.length == 0) hotkeyManager.RegisterHotkeys();
    pageWorkers.push(worker);

    worker.port.on('detach', function() {
        DetachPageWorker(worker);
    });
    worker.on('detach', function(){
        DetachPageWorker(worker);
    });
    worker.tab.on('activate', function(){
        ActivatePageWorker(worker);
    });

    if (prefs['Autoplay'])
    {
        worker.port.on('Play', function(){ EmitEventToLastActivePageWorker("MediaPause", worker); });
        //don't play on pause because someone is likely pausing to resume soon, not going back to the other media site
        //worker.port.on('Pause', function(){ EmitEventToLastActivePageWorker("MediaPlay", worker); });
        worker.port.on('Stop', function(){ EmitEventToLastActivePageWorker("MediaPlay", worker); });
    }
};

var ActivatePageWorker = function(worker)
{
    //only act if the array has more than one element
    if (pageWorkers.length > 1)
    {
        var indexOfWorker = pageWorkers.indexOf(worker);
        if (indexOfWorker != pageWorkers.length - 1)
        {
            //console.log("switching from " + pageWorkers[activePageWorkerIndex].url + " to " + pageWorkers[indexOfWorker].url);
            pageWorkers.splice(indexOfWorker, 1);
            pageWorkers.push(worker);
        }
    }
};

//Use this to detach message worker when the media page is closed
var DetachPageWorker = function(worker)
{
    var indexOfWorker = pageWorkers.indexOf(worker);
    if(indexOfWorker == -1) return;

    pageWorkers.splice(indexOfWorker, 1);

    setTimeout(function(){
        if (pageWorkers.length == 1)
        {
            if (prefs['Autoplay']) EmitEventToActivePageWorker({ data: "MediaPlay" });
        }
        else if (pageWorkers.length == 0)
        {
            hotkeyManager.UnregisterHotkeys();
        }
    }, 5000);
};

var Destroy = function(){
    while(pageWorkers.length > 0) pageWorkers.pop().destroy();
}

var EmitEventToActivePageWorker = function(event)
{
    //console.log("Sending " + event.data + " to " + pageWorkers[activePageWorkerIndex].url);
    pageWorkers[pageWorkers.length - 1].port.emit(event.data);
};

var EmitEventToLastActivePageWorker = function(eventData, emitter)
{
    var lastActivePageWorkerIndex = pageWorkers.length - 2;

    if (lastActivePageWorkerIndex < 0 || pageWorkers[lastActivePageWorkerIndex] === emitter) return;

    var pageWorker = pageWorkers[lastActivePageWorkerIndex];

    //console.log(`sending ${eventData} to ${pageWorker.url}`);
    pageWorker.port.emit(eventData);
};

exports.RegisterContentScripts = RegisterPageMods;
exports.EmitEventToActivePageWorker = EmitEventToActivePageWorker;
exports.EmitEventToLastActivePageWorker = EmitEventToLastActivePageWorker;
exports.Destroy = Destroy;