/**
 * MediaKeys namespace.
 */
if (typeof MediaKeys == "undefined") var MediaKeys = {};
if (typeof MediaKeys.pageDomain == "undefined") MediaKeys.pageDomain = "https://www.youtube.com";

MediaKeys.Init = function(undefined)
{
    //add page side script
    var pageScript = document.createElement("script");
    pageScript.innerHTML = `
        var pageDomain = "` + MediaKeys.pageDomain + `";
        var PlayerStates = {
            unstarted: -1,
            ended: 0,
            playing: 1,
            paused: 2
        };
        window.addEventListener("message", function(event) {
            var playVideo = function(){
                document.getElementById("movie_player").playVideo();
                window.postMessage("Play", pageDomain);
            };
            var pauseVideo = function(){
                document.getElementById("movie_player").pauseVideo();
                window.postMessage("Pause", pageDomain);
            };

            switch (event.data) {
                case "MediaPlayPause":
                    var player = document.getElementById("movie_player");
                    var status = player.getPlayerState();
                    if (status != PlayerStates.playing) {
                        playVideo();
                    }
                    else {
                        pauseVideo();
                    }
                    break;

                case "MediaPause":
                    pauseVideo();
                    break;

                case "MediaPlay":
                    playVideo();
                    break;

                case "MediaTrackNext":
                    document.getElementById("movie_player").nextVideo();
                    window.postMessage("Next", pageDomain);
                    break;

                case "MediaTrackPrevious":
                    document.getElementById("movie_player").previousVideo();
                    window.postMessage("Previous", pageDomain);
                    break;

                case "MediaStop":
                    document.getElementById("movie_player").stopVideo();
                    window.postMessage("Stop", pageDomain);
                    break;
            }
        });`;
    document.body.appendChild(pageScript);

    self.port.on("MediaPlayPause", function(){ window.postMessage("MediaPlayPause", MediaKeys.pageDomain) });
    self.port.on("MediaPlay", function(){ window.postMessage("MediaPlay", MediaKeys.pageDomain) });
    self.port.on("MediaPause", function(){ window.postMessage("MediaPause", MediaKeys.pageDomain) });
    self.port.on("MediaTrackNext", function(){ window.postMessage("MediaTrackNext", MediaKeys.pageDomain) });
    self.port.on("MediaTrackPrevious", function(){ window.postMessage("MediaTrackPrevious", MediaKeys.pageDomain) });
    self.port.on("MediaStop", function(){ window.postMessage("MediaStop", MediaKeys.pageDomain) });

    window.addEventListener("message", function(event) {
        self.port.emit(event.data);
    });
};

MediaKeys.Init();