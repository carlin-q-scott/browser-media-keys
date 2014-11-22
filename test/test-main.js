var main = require("./main");

exports["windows play/pause"] = function(assert, done)
{
	require("./windowsHotkeys").AttachEventListeners(function(event)
	{
		assert.equal(event.key, "MediaPlayPause");
		done();
	});
};

require("sdk/test").run(exports);