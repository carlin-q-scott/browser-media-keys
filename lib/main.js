var pageMod = require("sdk/page-mod");
var data = require("sdk/self").data;
var { viewFor } = require("sdk/view/core");
var workers = [];

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

var windows = require("sdk/windows").browserWindows;

//add media key event listener to all open windows
for (let window of windows) {
	AddMediaKeyEventListenerTo(window);
}
//add media key event listener to all future windows
windows.on("open", AddMediaKeyEventListenerTo);


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