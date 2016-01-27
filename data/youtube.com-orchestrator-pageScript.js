/**
 * MediaKeys namespace.
 */
if (typeof MediaKeys == "undefined") var MediaKeys = {};

MediaKeys.init = function() {
    var pageDomain = window.location.origin;
    var PlayerStates = {
        unstarted: -1,
        ended: 0,
        playing: 1,
        paused: 2
    };
    var playVideo = function () {
        document.getElementById("movie_player").playVideo();
        window.postMessage("Play", pageDomain);
    };
    var pauseVideo = function () {
        document.getElementById("movie_player").pauseVideo();
        window.postMessage("Pause", pageDomain);
    };

    window.addEventListener("message", function (event) {
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
    });
};

MediaKeys.init();