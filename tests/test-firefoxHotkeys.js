var hotkeyWorker = require("../lib/firefoxHotkeys");

exports["test register/de-register hotkeys"] = function(assert)
{
	hotkeyWorker.postMessage("attach");
	assert.pass("successfully registered hotkeys");
    //Todo: something to test that the hotkeys are registered
	hotkeyWorker.postMessage("detach");
	assert.pass("successfully de-registered hotkeys");
};

exports["test media play/pause"] = function(assert, done)
{
	TestMediaEvent("MediaPlayPause", "MediaPlayPause", assert, done);
};

exports["test media next track"] = function(assert, done)
{
    TestMediaEvent("MediaTrackNext", "MediaTrackNext", assert, function () {
        TestMediaEvent("MediaNextTrack", "MediaTrackNext", assert, done);
    });
};

exports["test media previous track"] = function(assert, done)
{
    TestMediaEvent("MediaTrackPrevious", "MediaTrackPrevious", assert, function() {
        TestMediaEvent("MediaPreviousTrack", "MediaTrackPrevious", assert, done);
    });
};

exports["test media stop"] = function(assert, done)
{
    TestMediaEvent("MediaStop", "MediaStop", assert, done);
};

exports["test media pause"] = function(assert, done)
{
    TestMediaEvent("MediaPause", "MediaPause", assert, done);
};

exports["test media play"] = function(assert, done)
{
    TestMediaEvent("MediaPlay", "MediaPlay", assert, done);
};

var TestMediaEvent = function(hotkey, expectedEvent, assert, done)
{
    hotkeyWorker.addEventListener(function(outcome){
        assert.equal(outcome.data, expectedEvent);
        done();
    });
    hotkeyWorker.KeyEventHandler({key: hotkey});
};

require("sdk/test").run(exports);