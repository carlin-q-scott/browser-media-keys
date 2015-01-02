exports["test register/de-register hotkeys"] = function(assert)
{
	var {Cu} = require("chrome");
	var {ChromeWorker} = Cu.import("resource://gre/modules/Services.jsm", null);
	var hotkeyWorker = new ChromeWorker(require("sdk/self").data.url("windowsHotkeys.js"));

	hotkeyWorker.postMessage("attach");
	assert.pass("successfully registered hotkeys");
	hotkeyWorker.postMessage("detach");
	assert.pass("successfully de-registered hotkeys");
}
require("sdk/test").run(exports);