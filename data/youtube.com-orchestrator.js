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
	
	//automatically pause other players while playing a video and resume them when done
	var latestState;
	window.setInterval(function(){
		var state = playerElement().getPlayerState();
		if (state != latestState)
		{
			latestState = state;
			switch(state)
			{
				case PlayerStates.playing:
					self.port.emit("Broadcast", "MediaPause");
					break;
				case PlayerStates.ended:
					self.port.emit("Broadcast", "MediaPlay");
					break;
			}
		}
	}, 1500);
};

MediaKeys.Init();