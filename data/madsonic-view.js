/**
 * MediaKeys namespace.
 */
/**
 * MediaKeys namespace.
 */
if (typeof MediaKeys == "undefined") var MediaKeys = {};

console.log("subsonic loaded");

MediaKeys.basePlayer = "//iframe[@id='playQueue']";

MediaKeys.playButton = "//span[contains(@id, 'startButton') and not(contains(@style,'display: none'))]";
MediaKeys.pauseButton = "//span[contains(@id, 'stopButton') and not(contains(@style,'display: none'))]";
MediaKeys.skipButton = "//span[@id='nextButton']";
MediaKeys.previousButton = "//span[@id='previousButton']";
