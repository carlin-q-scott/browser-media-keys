/**
 * MediaKeys namespace.
 */
/**
 * MediaKeys namespace.
 */
if (typeof MediaKeys == "undefined") var MediaKeys = {};

MediaKeys.playButton = "//a[contains(@class, 'PlayTrack') and not(contains(@style,'display: none'))]";
MediaKeys.pauseButton = "//a[contains(@class, 'PauseTrack') and not(contains(@style,'display: none'))]";
MediaKeys.skipButton = "//a[@id='NextTrack']";
MediaKeys.previousButton = "//a[@id='PreviousTrack']";
