/**
 * MediaKeys namespace.
 */
if (typeof MediaKeys == "undefined") var MediaKeys = {};

MediaKeys.init = function() {
    let player = document.querySelector('div.html5-video-player');
    let video = document.querySelector('video');
    let pageDomain = window.location.origin;

    let playVideo = function () {
        video.play();
    };
    let pauseVideo = function () {
        video.pause();
    };

    window.addEventListener("message", function (event) {
        switch (event.data) {
            case "MediaPlayPause":
                if (video.paused) {
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
                if (player) player.stopVideo();
                else pauseVideo();
                break;
        }
    });

    //automatically pause other players while playing a video and resume them when done
    let lastState;
    window.setInterval(function () {
        let currentState;
        if (video.paused) currentState = "paused";
        else if (video.ended) currentState = "ended";
        else currentState = "playing";

        if (currentState != lastState) {
            console.log(`player state transitioned from ${lastState} to ${currentState}`);
            lastState = currentState;
            switch (currentState) {
                case "playing":
                    window.postMessage("Play", pageDomain);
                    break;
                case "paused":
                    window.postMessage("Pause", pageDomain);
                    break;
                case "ended":
                    window.postMessage("Stop", pageDomain);
                    break;
            }
        }
    }, 1500);
};

MediaKeys.init();