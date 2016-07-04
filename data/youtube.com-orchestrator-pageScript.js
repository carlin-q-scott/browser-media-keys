/*eslint-env browser */
/**
 * MediaKeys namespace.
 */
if (typeof MediaKeys == "undefined") var MediaKeys = {};

MediaKeys.init = function() {
    var player = document.querySelector('div.html5-video-player');
    var pageDomain = window.location.origin;
    var PlayerStates = {
        unstarted: -1,
        ended: 0,
        playing: 1,
        paused: 2
    };
    var playVideo = function () {
        player.playVideo();
    };
    var pauseVideo = function () {
        player.pauseVideo();
    };

    window.addEventListener("message", function (event) {
        switch (event.data) {
            case "MediaPlayPause":
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
                player.nextVideo();
                window.postMessage("Next", pageDomain);
                break;

            case "MediaTrackPrevious":
                player.previousVideo();
                window.postMessage("Previous", pageDomain);
                break;

            case "MediaStop":
                player.stopVideo();
                break;
        }
    });

    //automatically pause other players while playing a video and resume them when done
    var latestState;
    window.setInterval(function () {
        var state = player.getPlayerState();
        if (state != latestState) {
            console.log(`youtube player state transitioned from ${latestState} to ${state}`);
            latestState = state;
            switch (state) {
                case PlayerStates.playing:
                    window.postMessage("Play", pageDomain);
                    break;
                case PlayerStates.paused:
                    window.postMessage("Pause", pageDomain);
                    break;
                case PlayerStates.ended:
                    window.postMessage("Stop", pageDomain);
                    break;
            }
        }
    }, 1500);
};

MediaKeys.init();