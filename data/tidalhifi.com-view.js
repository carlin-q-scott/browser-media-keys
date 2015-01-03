/**
 * MediaKeys namespace.
 */
if (typeof MediaKeys == "undefined") var MediaKeys = {};

MediaKeys.playButton = "//button[@data-test-id='play' and not(contains(@style,'none'))]";
MediaKeys.pauseButton = "//button[@data-test-id='pause' and not(contains(@style,'none'))]";
MediaKeys.skipButton = "//button[@data-test-id='next']";
MediaKeys.previousButton = "//button[@data-test-id='previous']";