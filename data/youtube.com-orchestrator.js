/**
 * MediaKeys namespace.
 */
if (typeof MediaKeys == "undefined") var MediaKeys = {};

MediaKeys.Init = function()
{
    var pageDomain = self.options.pageDomain;
    var pageScript = document.createElement("script");
    pageScript.id = "MediaKeysPageScript";
    pageScript.innerHTML = self.options.pageScript.replace("self.options.pageDomain", '"' + pageDomain + '"');
    document.body.appendChild(pageScript);

    self.port.on("MediaPlayPause", function(){ window.postMessage("MediaPlayPause", pageDomain) });
    self.port.on("MediaPlay", function(){ window.postMessage("MediaPlay", pageDomain) });
    self.port.on("MediaPause", function(){ window.postMessage("MediaPause", pageDomain) });
    self.port.on("MediaTrackNext", function(){ window.postMessage("MediaTrackNext", pageDomain) });
    self.port.on("MediaTrackPrevious", function(){ window.postMessage("MediaTrackPrevious", pageDomain) });
    self.port.on("MediaStop", function(){ window.postMessage("MediaStop", pageDomain) });

    window.addEventListener("message", function(event) {
        self.port.emit(event.data);
    });
};

MediaKeys.Init();