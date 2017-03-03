/**
* MediaKeys namespace.
*/
if (typeof MediaKeys == "undefined") var MediaKeys = {};

MediaKeys.basePlayer = "//iframe[@id='main']";
MediaKeys.playButton = "//button[@id='play' and not(contains(@class,'playing'))]";
MediaKeys.pauseButton = "//button[@id='play' and contains(@class,'playing')]";
MediaKeys.skipButton = "//button[@id='next']";
MediaKeys.previousButton = "//button[@id='previous']"; 
