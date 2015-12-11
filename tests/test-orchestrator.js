var tabs = require("sdk/tabs");
var { viewFor } = require("sdk/view/core");
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
        TestMediaEvent("MediaStop", "Pause", assert, done);
    });
};

exports["test play/pause on TidalHiFi.com"] = function(assert, done)
{
    OpenMediaWebsiteMock("tidalhifi.com", function() {
        TestMediaEvent("MediaPlayPause", "Pause", assert, function () {
            TestMediaEvent("MediaPlayPause", "Play", assert, done);
        });
    });
};

exports["test play next track on TidalHiFi.com"] = function(assert, done)
{
    OpenMediaWebsiteMock("tidalhifi.com", function() {
        TestMediaEvent("MediaTrackNext", "Next", assert, done);
    });
};

exports["test play previous track on TidalHiFi.com"] = function(assert, done)
{
    OpenMediaWebsiteMock("tidalhifi.com", function() {
        TestMediaEvent("MediaTrackPrevious", "Previous", assert, done);
    });
};

exports["test stop playing on TidalHiFi.com"] = function(assert, done)
{
    OpenMediaWebsiteMock("tidalhifi.com", function() {
        TestMediaEvent("MediaStop", "Pause", assert, done);
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
        TestMediaEvent("MediaStop", "Pause", assert, done);
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
        TestMediaEvent("MediaStop", "Pause", assert, done);
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