/**
 * MediaKeys namespace.
 */
if (typeof MediaKeys == "undefined") var MediaKeys = {};

MediaKeys.playButton = "//button[contains(concat(' ',normalize-space(@class),' '),' playControl ')]";
MediaKeys.pauseButton = "//button[contains(@class,'playing')]";
MediaKeys.skipButton = "//button[contains(@class,'next')]";
MediaKeys.previousButton = "//button[contains(@class,'previous')]";