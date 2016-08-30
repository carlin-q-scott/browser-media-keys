/**
 * MediaKeys namespace.
 */
if (typeof MediaKeys == "undefined") var MediaKeys = {};

MediaKeys.playButton = "//button[contains(@class,'playButton') and contains(@class, 'Play')]";
MediaKeys.pauseButton = "//button[contains(@class,'playButton') and contains(@class, 'Pause')";
MediaKeys.skipButton = "//a[contains(@class,'player-console-ui-nextButton')]";
MediaKeys.previousButton = "//a[contains(@class,'player-console-ui-prevButton')]";
