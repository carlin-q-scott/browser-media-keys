/**
 * MediaKeys namespace.
 */
if (typeof MediaKeys == "undefined") var MediaKeys = {};

MediaKeys.Init = function()
{
    var pageDomain = window.location.origin;
    var pageScript = document.createElement("script");

    var attachPageScript = function(){
        pageScript.id = "media-keys";
        pageScript.src = self.options.pageScript;
        document.body.appendChild(pageScript);
    };
    attachPageScript();

    self.port.on("attach", attachPageScript);

    self.port.on("MediaPlayPause", function(){ window.postMessage("MediaPlayPause", pageDomain) });
    self.port.on("MediaPlay", function(){ window.postMessage("MediaPlay", pageDomain) });
    self.port.on("MediaPause", function(){ window.postMessage("MediaPause", pageDomain) });
    self.port.on("MediaTrackNext", function(){ window.postMessage("MediaTrackNext", pageDomain) });
    self.port.on("MediaTrackPrevious", function(){ window.postMessage("MediaTrackPrevious", pageDomain) });
    self.port.on("MediaStop", function(){ window.postMessage("MediaStop", pageDomain) });

    window.addEventListener("message", function(event) {
        self.port.emit(event.data);
    });

    self.port.on("detach", function(){
        if (document.body && document.body.contains(pageScript)) document.body.removeChild(pageScript);
    });
};

MediaKeys.Init();