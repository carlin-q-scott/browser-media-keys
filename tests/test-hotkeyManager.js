var hotkeyManager = require("../lib/hotkeyManager");
var { setTimeout } = require("sdk/timers");

//exports["disabled toggle play"]
var togglePlayTest = function(assert, done)
{
	var tabs = require("sdk/tabs");
	var { data, test } = require("sdk/self");
	
	//hotkeyWorker.addEventListener(
	hotkeyWorker.postMessage("attach");
	tabs.on('ready', function(tab){
		hotkeyWorker.KeyEventHandler({key: "MediaPlayPause"});
	});
	
	tabs.open({
		url: test.url(pageDomain + ".html"),
		contentScriptFile: [data.url("Finder.js"), data.url(pageDomain + "-view.js"), data.url(pageDomain + "-orchestrator.js")],
		onMessage: function(data){
			assert.equal("MediaPlayPause", data);
			done();
		}
	});
};

exports["update property"] = function(assert, done)
{
	var preferences = require("sdk/simple-prefs");
	hotkeyManager.RegisterContentScripts();
    preferences.prefs["jamstashDomains"] = "cats and dogs";
	assert.equal(preferences.prefs["jamstashDomains"], "cats and dogs");
	setTimeout(done, 5000);
};

require("sdk/test").run(exports);