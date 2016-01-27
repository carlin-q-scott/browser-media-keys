/**
 * MediaKeys namespace.
 */
if (typeof MediaKeys == "undefined") var MediaKeys = {};

MediaKeys.playButton = "//div[(@id='pd_play' or @id='ac_play' or @id='gp_play') and not(contains(@class,'playing'))]";
MediaKeys.pauseButton = "//div[(@id='pd_play' or @id='ac_play' or @id='gp_play') and contains(@class,'playing')]";
MediaKeys.skipButton = "//div[@class='next ctrl']";
MediaKeys.previousButton = "//div[@class='prev ctrl']";