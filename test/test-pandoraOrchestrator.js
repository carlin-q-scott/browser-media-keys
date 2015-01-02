var tabs = require("sdk/tabs");
var pageDomain = "pandora.com";
var { viewFor } = require("sdk/view/core");
var { data } = require("sdk/self");

function OpenMediaWebsiteMock()
{	
	tabs.open(data.url("pandora.com.html"));
}

exports["test media play/pause"] = function(assert, done)
{
	tabs.on('ready', function(tab){
		var pandoraWorker = tab.attach({
			contentScriptFile: ["./Finder.js", "./" + pageDomain + "-view.js", "./" + pageDomain + "-orchestrator.js"]				
		});
		
		var pageStatusWorker = tab.attach({
			contentScript: "self.port.on('status', function(){ self.port.emit('status', document.getElementById('status').innerHTML); });"
		});
		
		pandoraWorker.port.once("MediaPlayPause", function(){
			pageStatusWorker.port.once('status', function(status){
				assert.equal(status, "paused", "expected player to be paused after pausing");
				pandoraWorker.port.once("MediaPlayPause", function(){
					pageStatusWorker.port.once('status', function(status){
						assert.equal(status, "playing", "expected player to be playing after clicking play");
						tab.close(done);
					});
					pageStatusWorker.port.emit('status');
				});
				pandoraWorker.port.emit("MediaPlayPause");
			});
			pageStatusWorker.port.emit('status');
		});
		
		pageStatusWorker.port.once('status', function(status){
			assert.equal(status, "playing", "expected player to initially be playing");
		});
		pageStatusWorker.port.emit('status');
		
		pandoraWorker.port.emit("MediaPlayPause");
	});
	
	OpenMediaWebsiteMock();
}

require("sdk/test").run(exports);