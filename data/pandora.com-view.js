/**
 * MediaKeys namespace.
 */
if (typeof MediaKeys == "undefined") var MediaKeys = {};

MediaKeys.playButton = "//div[@class='playButton' and not(contains(@style,'none'))]";
MediaKeys.pauseButton = "//div[@class='pauseButton' and not(contains(@style,'none'))]";
MediaKeys.skipButton = "//div[@class='skipButton']";
MediaKeys.trackInfoContainer = "//*[@id='trackInfoContainer']";
MediaKeys.trackInfo = "//*[contains(@class,'trackData')]";