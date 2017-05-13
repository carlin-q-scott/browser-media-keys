/**
 * MediaKeys namespace.
 */
if (typeof MediaKeys == "undefined") var MediaKeys = {};

MediaKeys.playButton = "//button[contains(@class,'paused')]";
MediaKeys.pauseButton = "//button[contains(@class,'playing')]";
MediaKeys.skipButton = "//a[contains(@class,'forward')]";
MediaKeys.previousButton = "//a[contains(@class,'rewind')]";