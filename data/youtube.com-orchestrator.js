/**
 * MediaKeys namespace.
 */
if (typeof MediaKeys == "undefined") var MediaKeys = {};

MediaKeys.Init = function()
{
    var maxPlayerLoadTime = 3000;
    var checkForPlayerInteval = 250;

    var attemptToAttachPageScript = function() {
        //console.log(`attempting to find youtube player. ${maxPlayerLoadTime} millis remaining...`)
        maxPlayerLoadTime -= checkForPlayerInteval;
        if (maxPlayerLoadTime == 0 )
        {
            console.log("didn't find youtube player");
            clearInterval(intervalId);
            self.port.emit("detach");
            return;
        }
        if (! window.document.querySelector('div.html5-video-player')) return; //because there's no youtube player
        clearInterval(intervalId);

        var pageDomain = window.location.origin;
        var pageScript = document.createElement("script");

        var attachPageScript = function () {
            pageScript.id = "media-keys";
            pageScript.src = self.options.pageScriptFile;
            document.body.appendChild(pageScript);
        };
        attachPageScript();

        self.port.on("attach", attachPageScript);

        self.port.on("MediaPlayPause", function () {
            window.postMessage("MediaPlayPause", pageDomain)
        });
        self.port.on("MediaPlay", function () {
            window.postMessage("MediaPlay", pageDomain)
        });
        self.port.on("MediaPause", function () {
            window.postMessage("MediaPause", pageDomain)
        });
        self.port.on("MediaTrackNext", function () {
            window.postMessage("MediaTrackNext", pageDomain)
        });
        self.port.on("MediaTrackPrevious", function () {
            window.postMessage("MediaTrackPrevious", pageDomain)
        });
        self.port.on("MediaStop", function () {
            window.postMessage("MediaStop", pageDomain)
        });

        window.addEventListener("message", function (event) {
            self.port.emit(event.data);
        });

        self.port.on("detach", function () {
            if (document.body !== undefined && document.body.contains(pageScript)) document.body.removeChild(pageScript);
            self.port.emit("detach");
        });
    };

    var intervalId = setInterval(attemptToAttachPageScript, checkForPlayerInteval);
    attemptToAttachPageScript();
};

MediaKeys.Init();