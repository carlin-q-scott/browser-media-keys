var tabs = require("sdk/tabs");
var { viewFor } = require("sdk/view/core");
var { data } = require("sdk/self");
var { setTimeout } = require("sdk/timers");

function OpenMediaWebsiteMock(domain)
{	
	tabs.open(data.url(domain + ".html"));
}

exports["test play/pause on Pandora.com"] = function(assert, done)
{
	TestPlayPauseFor("pandora.com", assert, done);
}

exports["test skip track on Pandora.com"] = function(assert, done)
{
	TestMediaEvent("pandora.com", "MediaNextTrack", assert, done);
}

exports["test stop playing on Pandora.com"] = function(assert, done)
{
	TestMediaEvent("pandora.com", "MediaStop", assert, done);
}

exports["test play/pause on TidalHiFi.com"] = function(assert, done)
{
	TestPlayPauseFor("tidalhifi.com", assert, done);
}

exports["test play next track on TidalHiFi.com"] = function(assert, done)
{
	TestMediaEvent("tidalhifi.com", "MediaNextTrack", assert, done);
}

exports["test play previous track on TidalHiFi.com"] = function(assert, done)
{
	TestMediaEvent("tidalhifi.com", "MediaPreviousTrack", assert, done);
}

exports["test stop playing on TidalHiFi.com"] = function(assert, done)
{
	TestMediaEvent("tidalhifi.com", "MediaStop", assert, done);
}

function TestPlayPauseFor(pageDomain, assert, done)
{
	tabs.once('ready', function(tab){
		var pageWorker = tab.attach({
			contentScriptFile: ["./Finder.js", "./" + pageDomain + "-view.js", "./orchestrator.js"]				
		});
		
		var pageStatusWorker = tab.attach({
			contentScript: "self.port.on('status', function(){ self.port.emit('status', document.getElementById('status').innerHTML); });"
		});
		
		setTimeout(function(){
			pageStatusWorker.port.once('status', function(status){
				assert.equal(status, "paused", "expected player to be paused after pausing");
				setTimeout(function(){
					pageStatusWorker.port.once('status', function(status){
						assert.equal(status, "playing", "expected player to be playing after clicking play");
						tab.close(done);
					});
					pageStatusWorker.port.emit('status');
				}, 100);
				pageWorker.port.emit("MediaPlayPause");
			});
			pageStatusWorker.port.emit('status');
		}, 100);
		
		pageStatusWorker.port.once('status', function(status){
			assert.equal(status, "playing", "expected player to initially be playing");
		});
		pageStatusWorker.port.emit('status');
		
		pageWorker.port.emit("MediaPlayPause");
	});
	
	OpenMediaWebsiteMock(pageDomain);
}

function TestMediaEvent(pageDomain, mediaEvent, assert, done)
{
	var initialStatus;
	
	tabs.once('ready', function(tab){
		var pageWorker = tab.attach({
			contentScriptFile: ["./Finder.js", "./" + pageDomain + "-view.js", "./orchestrator.js"]				
		});
		
		var pageStatusWorker = tab.attach({
			contentScript: "self.port.on('status', function(){ self.port.emit('status', document.getElementById('status').innerHTML); });"
		});
		
		setTimeout(function(){
			pageStatusWorker.port.once('status', function(status){
				assert.notEqual(status, initialStatus, "expected player status to change");
				tab.close(done);
			});
			pageStatusWorker.port.emit('status');
		}, 100);
		
		pageStatusWorker.port.once('status', function(status){
			initialStatus = status;
		});
		pageStatusWorker.port.emit('status');
		
		pageWorker.port.emit(mediaEvent);
	});
	
	OpenMediaWebsiteMock(pageDomain);
}

require("sdk/test").run(exports);