/**
 * MediaKeys namespace.
 */
/**
 * MediaKeys namespace.
 */
if (typeof MediaKeys == "undefined") var MediaKeys = {};

console.log("koel loaded");

MediaKeys.playButton = "//span[contains(@class, 'play') and contains(@class,'control') and not(contains(@style,'display: none'))]";
MediaKeys.pauseButton = "//span[contains(@class, 'pause') and contains(@class,'control') and not(contains(@style,'display: none'))]";
MediaKeys.skipButton = "//i[contains(@class, 'next') and contains(@class,'control')]";
MediaKeys.previousButton = "//i[contains(@class, 'prev') and contains(@class,'control')]";
