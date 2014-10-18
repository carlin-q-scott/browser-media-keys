var pageMod = require("sdk/page-mod");
var data = require("sdk/self").data;
var { viewFor } = require("sdk/view/core");
var workers = [];

function detachWorker(worker, workerArray) {
  var index = workerArray.indexOf(worker);
  if(index != -1) {
    workerArray.splice(index, 1);
  }
}

pageMod.PageMod({
		include: "*.pandora.com",
		contentScriptFile: data.url("PandoraOrchestrator.js"),
		onAttach: function(worker){
			workers.push(worker);
			worker.on('detach', function() {
				detachWorker(this, workers);
			});
		}
});

var window = viewFor(require("sdk/windows").browserWindows[0]);
window.addEventListener("keydown", function (event) {
  if (event.defaultPrevented) {
    return; // Should do nothing if the key event was already consumed.
  }

  var handled = false;
  if (event.key !== undefined) {
    // Handle the event with KeyboardEvent.key and set handled true.
    if (event.key == "MediaPlayPause"){  
		//for (worker in workers){
			workers[0].port.on("PlayToggled", function(){ handled = true; });
			workers[0].port.emit("TogglePlay");
		//}
    }
  } else if (event.keyIdentifier !== undefined) {
    // Handle the event with KeyboardEvent.keyIdentifier and set handled true.
  } else if (event.keyCode !== undefined) {
    if (event.keyCode == 0x13 || event.keyCode == 0x7E) {
		//pause_break key event
      //use this to support other browsers since they cannot receive media key events
    }
  }

  if (handled) {
    // Consume the event for suppressing "double action".
    event.preventDefault();
  }
}, true);