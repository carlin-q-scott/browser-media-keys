exports["test initialize hotkeys"] = function(assert)
{
	require("../index");
	assert.pass("hotkeys initialized");
};

exports["disabled toggle play"] = function(assert, done)
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

require("sdk/test").run(exports);