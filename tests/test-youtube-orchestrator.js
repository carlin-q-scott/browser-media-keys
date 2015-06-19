var tabs = require("sdk/tabs");
var { viewFor } = require("sdk/view/core");
var { data } = require("sdk/self");
var pageWorker;

function OpenMediaWebsiteMock(pageDomain, done)
{
    tabs.once('ready', function(tab) {
        var pageScript = data.load("./youtube.com-orchestrator-pageScript.js");

        pageWorker = tab.attach({
            contentScriptFile: "./youtube.com-orchestrator.js",
            contentScriptOptions: {
                pageScript: pageScript,
                pageDomain: "*"
            }
        });
        done();
    });

    tabs[0].url = data.url(pageDomain + ".html");
}

exports["test play on YouTube.com"] = function(assert, done)
{
    OpenMediaWebsiteMock("youtube.com", function() {
        TestMediaEvent("MediaPlay", "Play", assert, done);
    });
};

exports["test pause playing on YouTube.com"] = function(assert, done)
{
    OpenMediaWebsiteMock("youtube.com", function() {
        TestMediaEvent("MediaPause", "Pause", assert, done);
    });
};

exports["test play/pause on YouTube.com"] = function(assert, done)
{
    OpenMediaWebsiteMock("youtube.com", function() {
        TestMediaEvent("MediaPlayPause", "Pause", assert, function () {
            TestMediaEvent("MediaPlayPause", "Play", assert, done);
        });
    });
};

exports["test play next track on YouTube.com"] = function(assert, done)
{
    OpenMediaWebsiteMock("youtube.com", function() {
        TestMediaEvent("MediaTrackNext", "Next", assert, done);
    });
};

exports["test play previous track on YouTube.com"] = function(assert, done)
{
    OpenMediaWebsiteMock("youtube.com", function() {
        TestMediaEvent("MediaTrackPrevious", "Previous", assert, done);
    });
};

exports["test stop playing on YouTube.com"] = function(assert, done)
{
    OpenMediaWebsiteMock("youtube.com", function() {
        TestMediaEvent("MediaStop", "Stop", assert, done);
    });
};

function TestMediaEvent(mediaEvent, mediaEventOutcome, assert, done)
{
    pageWorker.port.once(mediaEventOutcome, function() {
        assert.ok(true, mediaEvent + " successfully triggered outcome: " + mediaEventOutcome);
        done();
    });

    pageWorker.port.emit(mediaEvent);
}

require("sdk/test").run(exports);