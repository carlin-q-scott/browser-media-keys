/**
 * MediaKeys namespace.
 */
if (typeof MediaKeys == "undefined") var MediaKeys = {};

MediaKeys.playButton = "//button[@id='play-control' and contains(@class, 'play')]";
MediaKeys.pauseButton = "//button[@id='play-control' and contains(@class, 'pause')]";
MediaKeys.skipButton = "//button[@id='next-control']";
MediaKeys.previousButton = "//button[@id='previous-control']";
