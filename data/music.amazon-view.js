/**
 * MediaKeys namespace.
 */
if (typeof MediaKeys == "undefined") var MediaKeys = {};

MediaKeys.playButton = "//*[contains(@class, 'playerIconPlay')]";
MediaKeys.pauseButton = "//*[contains(@class, 'playerIconPause')]";
MediaKeys.skipButton = "//*[contains(@class, 'nextButton')]";
MediaKeys.previousButton = "//*[contains(@class, 'previousButton')]";

//MediaKeys.trackInfoContainer = "//*[@class='playbackControlsView']"
MediaKeys.trackInfo = "//*[@class='trackInfoContainer']";