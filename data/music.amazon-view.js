/**
 * MediaKeys namespace.
 */
if (typeof MediaKeys == "undefined") var MediaKeys = {};

MediaKeys.playButton = "//section[contains(@class,'playbackControlsView')]//*[contains(@class, 'playerIconPlay')]";
MediaKeys.pauseButton = "//section[contains(@class,'playbackControlsView')]//*[contains(@class, 'playerIconPause')]";
MediaKeys.skipButton = "//*[contains(@class, 'nextButton')]";
MediaKeys.previousButton = "//*[contains(@class, 'previousButton')]";

//MediaKeys.trackInfoContainer = "//*[@class='playbackControlsView']"
MediaKeys.trackInfo = "//*[@class='trackInfoContainer']";