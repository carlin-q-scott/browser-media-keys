var hotkeyWorker = require("../lib/firefoxHotkeys")
var pageDomain = "pandora.com";

exports["test register/de-register hotkeys"] = function(assert)
{
	hotkeyWorker.postMessage("attach");
	assert.pass("successfully registered hotkeys");
	hotkeyWorker.postMessage("detach");
	assert.pass("successfully de-registered hotkeys");
}

exports["test media play/pause"] = function(assert, done)
{
	hotkeyWorker.addEventListener(function(event){
		assert.equal(event.data, "MediaPlayPause", "media play/pause completed");
		done();
	});
	hotkeyWorker.KeyEventHandler({key: "MediaPlayPause"});	
}

require("sdk/test").run(exports);