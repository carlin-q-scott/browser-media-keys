/**
 * Created by Carlin on 2/7/2016.
 */
var { setTimeout } = require("sdk/timers");
var hotkeyManager = require("./hotkeyManager");
var { prefs } = require("sdk/simple-prefs");
var { storage } = require("sdk/simple-storage");

//initialize persistent storage
if (!storage.pins) storage.pins = [];

/**
 * Keeps track of the page workers managed by this module
 */
var pageWorkers = {
    pageWorkers: [],
    get current(){
        return this.pageWorkers[this.pageWorkers.length - 1];
    },
    set current(worker){
        //only act if the array has more than one element
        if (this.pageWorkers.length > 1 && !this.current.pinned)
        {
            var indexOfWorker = this.pageWorkers.indexOf(worker);
            if (indexOfWorker != this.pageWorkers.length - 1)
            {
                //console.log("switching from " + pageWorkers[activePageWorkerIndex].url + " to " + pageWorkers[indexOfWorker].url);
                this.pageWorkers.splice(indexOfWorker, 1);
                this.pageWorkers.push(worker);
            }
        }        
    },
    get previous(){
        var lastActivePageWorkerIndex = this.pageWorkers.length - 2;

        if (lastActivePageWorkerIndex < 0) return null;

        return this.pageWorkers[lastActivePageWorkerIndex];
    },
    get empty(){
        return this.pageWorkers.length == 0;
    },
    add: function(worker){
        var pageWorkersLength = this.pageWorkers.length;
        //not making previously pinned worker active
        if (pageWorkersLength == 0 || !this.current.pinned)
            this.pageWorkers.push(worker);
        else 
        {
            //todo: deal with multiple pinned workers
            this.pageWorkers.splice(pageWorkersLength - 1, 0, worker);
        }
    },
    remove: function(worker){
        var indexOfWorker = this.pageWorkers.indexOf(worker);
        if(indexOfWorker == -1)
        {
            //console.warn(`attempted to detach untracked pageWorker for ${worker.url}`);
            return;
        }

        this.pageWorkers.splice(indexOfWorker, 1);
    },
    findWorkerWithTabId: function(tabId){
        return this.pageWorkers.find(function(worker){
            return worker.tab.id == tabId;
        });
    },
    pin: function(worker){
        this.current = worker;
        worker.pinned = true;
    },
    unpin: function(worker) {
        worker.pinned = false;
        if (this.previous.pinned) this.current = this.previous;
        else{
            var tabs = require("sdk/tabs");
            var currentTabWorker = this.findWorkerWithTabId(tabs.activeTab.id);
            //not making the currently active tab the active media player
            if (currentTabWorker) this.current = currentTabWorker;
        }
    },
    /**
     * Destroys all the contained page workers.
     */
    destroy: function(){
        while(this.pageWorkers.length > 0) this.pageWorkers.pop().destroy();
    }
}

function RegisterPageMods()
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
        if (typeof pageModSpec.include === "string" && pageModSpec.include.startsWith("@"))
        {
            prefName = pageModSpec.include.substr(1);
            pageModSpec.include = prefs[prefName].split(" ");
        }
        /*failed attempt to support regex url matching
        if (typeof pageModSpec.include === "string" && pageModSpec.include.startsWith("/"))
            pageModSpec.include = [new RegExp(pageModSpec.include)];*/
        if (pageModSpec.contentScriptOptions !== undefined && pageModSpec.contentScriptOptions.pageScriptFile !== undefined)
            pageModSpec.contentScriptOptions.pageScriptFile = data.url(pageModSpec.contentScriptOptions.pageScriptFile);
        pageModSpec.onAttach = AttachWorkerToPage;

        pageMod.PageMod(pageModSpec);
    }
}

function AttachWorkerToPage(worker)
{
    if (pageWorkers.empty) hotkeyManager.RegisterHotkeys();
    pageWorkers.add(worker);

    worker.port.on("self-destruct", function() {
        worker.destroy();
        DetachPageWorker(worker);
    });
    worker.on("detach", function(){
        DetachPageWorker(worker);
    });
    worker.tab.on("activate", function(){
        ActivatePageWorker(worker);
    });

    if (prefs["Autoplay"])
    {
        worker.port.on("Play", function(){ EmitEventToLastActivePageWorker("MediaPause", worker); });
        //don't play on pause because someone is likely pausing to resume soon, not going back to the other media site
        //worker.port.on('Pause', function(){ EmitEventToLastActivePageWorker("MediaPlay", worker); });
        worker.port.on("Stop", function(){ EmitEventToLastActivePageWorker("MediaPlay", worker); });
    }
    
    worker.include = this.include[0];   //this is the PageModSpec
    
    if (storage.pins.find( pin => pin === worker.include ))
        worker.pinned = true;
}

function TogglePin(worker)
{
    if (worker.pinned){
        pageWorkers.unpin(worker);
        var indexOfPin = storage.pins.indexOf(worker.include);
        storage.pins.splice(indexOfPin, 1);      
    }
    else{
        pageWorkers.pin(worker);
        storage.pins.push(worker.include);  
    }
}

function ActivatePageWorker(worker)
{    
    pageWorkers.current = worker;
}

//Use this to detach message worker when the media page is closed
function DetachPageWorker(worker)
{
    pageWorkers.remove(worker);
    //console.warn(`detached pageWorker for ${worker.url}`)

    setTimeout(function(){
        if (pageWorkers.empty) hotkeyManager.UnregisterHotkeys();
    }, 5000);
}

function EmitEventToActivePageWorker(event)
{
    //console.log("Sending " + event.data + " to " + pageWorkers[activePageWorkerIndex].url);
    pageWorkers.current.port.emit(event.data);
}

function EmitEventToLastActivePageWorker(eventData, emitter)
{
    var pageWorker = pageWorkers.previous;
    if (pageWorker == null || pageWorker === emitter) return;

    //console.log(`sending ${eventData} to ${pageWorker.url}`);
    pageWorker.port.emit(eventData);
}

function HandleTabContextMenuPopupShowing(event){
    var { viewFor } = require("sdk/view/core");
    var window = require("sdk/windows").browserWindows.activeWindow;
    let doc = viewFor(window).document;
    var tabUtils = require("sdk/tabs/utils");
    var tabId = tabUtils.getTabId(event.target.triggerNode);
    var worker = pageWorkers.findWorkerWithTabId(tabId);
    var menuitem = doc.getElementById("media-keys-pin");
    
    if (!worker) menuitem.setAttribute("hidden", true);
    else {
        menuitem.setAttribute("hidden", false);
        if (worker.pinned) menuitem.setAttribute("label", "Unpin Media Keys");
        else menuitem.setAttribute("label", "Pin Media Keys"); 
    }
    doc.MediaKeys.togglePinWorkerContext = worker;
}

function SetUpPinnerForWindow(window){
    // Convert higher-level object to lower-level one
    var { viewFor } = require("sdk/view/core");
    let doc = viewFor(window).document;
    
    if (!doc.MediaKeys) doc.MediaKeys = {};
    doc.MediaKeys.TogglePin = TogglePin;
    
    let newTabContextMenuItem = doc.createElementNS("http://www.mozilla.org/keymaster/gatekeeper/there.is.only.xul","menuitem");
    newTabContextMenuItem.setAttribute("id", "media-keys-pin");
    newTabContextMenuItem.setAttribute("label", "Pin Media Keys");
    newTabContextMenuItem.setAttribute("accesskey", "k");
    newTabContextMenuItem.setAttribute("oncommand", "MediaKeys.TogglePin(MediaKeys.togglePinWorkerContext); delete MediaKeys.togglePinWorkerContext;");
    
    let menu = doc.getElementById("tabContextMenu");
    menu.appendChild(newTabContextMenuItem);
    
    menu.addEventListener("popupshowing", HandleTabContextMenuPopupShowing);
}

function DestroyPinnerForWindow(window){
    var { viewFor } = require("sdk/view/core");
    let doc = viewFor(window).document;
        
    var menu = doc.getElementById("tabContextMenu");
    menu.removeEventListener("popupshowing", HandleTabContextMenuPopupShowing);
    
    var menuItem = doc.getElementById("media-keys-pin");
    menu.removeChild(menuItem);
    
    delete doc.MediaKeys;
}

function SetUpPinner(){
    var windows = require("sdk/windows").browserWindows;
    
    //future windows
    windows.on("open", SetUpPinnerForWindow);
    
    //current windows
    for (let window of windows) SetUpPinnerForWindow(window);    
}

function DestroyPinner(){
    var windows = require("sdk/windows").browserWindows;
    
    //future windows
    windows.removeListener("open", SetUpPinnerForWindow);
    
    //current windows
    for (let window of windows) DestroyPinnerForWindow(window);     
}

function Init(){
    RegisterPageMods();
    SetUpPinner();
}

function Destroy(){
    pageWorkers.destroy();
    DestroyPinner();
}

exports.RegisterContentScripts = RegisterPageMods;
exports.EmitEventToActivePageWorker = EmitEventToActivePageWorker;
exports.EmitEventToLastActivePageWorker = EmitEventToLastActivePageWorker;
exports.Destroy = Destroy;
exports.Init = Init;