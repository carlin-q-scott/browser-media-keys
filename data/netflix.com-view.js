
/**
 * MediaKeys namespace.
 */
if (typeof MediaKeys == "undefined") var MediaKeys = {};

MediaKeys.playButton = "//div[@class='player-control-button player-play-pause play icon-player-play' and not(contains(@style,'none'))]";
MediaKeys.pauseButton = "//div[@class='player-control-button player-play-pause pause icon-player-play' and not(contains(@style,'none'))]";
MediaKeys.skipButton = "//div[@class='player-control-a11y-button']";
MediaKeys.stopButton = "//a[@class='player-back-to-browsing no-select container-icon-player-back-to-browse']";

