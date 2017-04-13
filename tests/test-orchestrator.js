var tabs = require("sdk/tabs");
var { data } = require("sdk/self");
var { setTimeout } = require("sdk/timers");
var pageWorker;

function OpenMediaWebsiteMock(pageDomain, done)
{
    tabs.once('ready', function(tab) {
        pageWorker = tab.attach({
            contentScriptFile: ["./Finder.js", "./" + pageDomain + "-view.js", "./orchestrator.js"]
        });
        setTimeout(done, 100);
    });

	tabs[0].url = data.url("../tests/" + pageDomain + ".html");
}

exports["test play/pause on Pandora.com"] = function(assert, done)
{
    OpenMediaWebsiteMock("pandora.com", function(){
        TestMediaEvent("MediaPlayPause", "Pause", assert, function() {
            TestMediaEvent("MediaPlayPause", "Play", assert, done);
        });
    });
};

exports["test skip track on Pandora.com"] = function(assert, done)
{
    OpenMediaWebsiteMock("pandora.com", function() {
        TestMediaEvent("MediaTrackNext", "Next", assert, done);
    });
};

exports["test stop playing on Pandora.com"] = function(assert, done)
{
    OpenMediaWebsiteMock("pandora.com", function() {
        TestMediaEvent("MediaStop", "Stop", assert, done);
    });
};

exports["test play/pause on tidal.com"] = function(assert, done)
{
    OpenMediaWebsiteMock("tidal.com", function() {
        TestMediaEvent("MediaPlayPause", "Pause", assert, function () {
            TestMediaEvent("MediaPlayPause", "Play", assert, done);
        });
    });
};

exports["test play next track on tidal.com"] = function(assert, done)
{
    OpenMediaWebsiteMock("tidal.com", function() {
        TestMediaEvent("MediaTrackNext", "Next", assert, done);
    });
};

exports["test play previous track on tidal.com"] = function(assert, done)
{
    OpenMediaWebsiteMock("tidal.com", function() {
        TestMediaEvent("MediaTrackPrevious", "Previous", assert, done);
    });
};

exports["test stop playing on tidal.com"] = function(assert, done)
{
    OpenMediaWebsiteMock("tidal.com", function() {
        TestMediaEvent("MediaStop", "Stop", assert, done);
    });
};

exports["test play/pause on open.spotify.com"] = function(assert, done)
{
    OpenMediaWebsiteMock("open.spotify.com", function(){
        TestMediaEvent("MediaPlayPause", "Pause", assert, function() {
            TestMediaEvent("MediaPlayPause", "Play", assert, done);
        });
    });
};

exports["test play next track on open.spotify.com"] = function(assert, done)
{
    OpenMediaWebsiteMock("open.spotify.com", function() {
        TestMediaEvent("MediaTrackNext", "Next", assert, done);
    });
};

exports["test play previous track on open.spotify.com"] = function(assert, done)
{
    OpenMediaWebsiteMock("open.spotify.com", function() {
        TestMediaEvent("MediaTrackPrevious", "Previous", assert, done);
    });
};

exports["test stop playing on open.spotify.com"] = function(assert, done)
{
    OpenMediaWebsiteMock("open.spotify.com", function() {
        TestMediaEvent("MediaStop", "Stop", assert, done);
    });
};

exports["test play/pause on player.spotify.com"] = function(assert, done)
{
    OpenMediaWebsiteMock("player.spotify.com", function(){
        TestMediaEvent("MediaPlayPause", "Pause", assert, function() {
            TestMediaEvent("MediaPlayPause", "Play", assert, done);
        });
    });
};

exports["test play next track on player.spotify.com"] = function(assert, done)
{
    OpenMediaWebsiteMock("player.spotify.com", function() {
        TestMediaEvent("MediaTrackNext", "Next", assert, done);
    });
};

exports["test play previous track on player.spotify.com"] = function(assert, done)
{
    OpenMediaWebsiteMock("player.spotify.com", function() {
        TestMediaEvent("MediaTrackPrevious", "Previous", assert, done);
    });
};

exports["test stop playing on player.spotify.com"] = function(assert, done)
{
    OpenMediaWebsiteMock("player.spotify.com", function() {
        TestMediaEvent("MediaStop", "Stop", assert, done);
    });
};

exports["test play/pause on play.spotify.com"] = function(assert, done)
{
    OpenMediaWebsiteMock("play.spotify.com", function(){
        TestMediaEvent("MediaPlayPause", "Pause", assert, function() {
            TestMediaEvent("MediaPlayPause", "Play", assert, done);
        });
    });
};

exports["test play next track on play.spotify.com"] = function(assert, done)
{
    OpenMediaWebsiteMock("play.spotify.com", function() {
        TestMediaEvent("MediaTrackNext", "Next", assert, done);
    });
};

exports["test play previous track on play.spotify.com"] = function(assert, done)
{
    OpenMediaWebsiteMock("play.spotify.com", function() {
        TestMediaEvent("MediaTrackPrevious", "Previous", assert, done);
    });
};

exports["test stop playing on play.spotify.com"] = function(assert, done)
{
    OpenMediaWebsiteMock("play.spotify.com", function() {
        TestMediaEvent("MediaStop", "Stop", assert, done);
    });
};

exports["test play/pause button on pocketcasts.com"] = function(assert, done)
{
    OpenMediaWebsiteMock("pocketcasts.com", function() {
        TestMediaEvent("MediaPlayPause", "Play", assert, function() {
            TestMediaEvent("MediaPlayPause", "Pause", assert, done);
        });
    });
};

exports["test start playing on pocketcasts.com"] = function(assert, done)
{
    OpenMediaWebsiteMock("pocketcasts.com", function() {
        TestMediaEvent("MediaPlay", "Play", assert, done);
    });
};

exports["test start and then stop playing on pocketcasts.com"] = function(assert, done)
{
    OpenMediaWebsiteMock("pocketcasts.com", function() {
        TestMediaEvent("MediaPlay", "Play", assert, function() {
            TestMediaEvent("MediaStop", "Stop", assert, done);
        });
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
