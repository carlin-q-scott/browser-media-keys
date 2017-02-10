/**
 * MediaKeys namespace.
 */
if (typeof MediaKeys == "undefined") var MediaKeys = {};

MediaKeys.playButton = "//*[@data-qa='play_button' or @class='playButton' and not(contains(@style,'none'))]";
MediaKeys.pauseButton = "//*[@data-qa='pause_button' or @class='pauseButton' and not(contains(@style,'none'))]";
MediaKeys.previousButton = "//*[@data-qa='replay_button' or @class='skipButton']";
MediaKeys.skipButton = "//*[@data-qa='skip_button']";
MediaKeys.trackInfoContainer = "//*[contains(@data-reactid,'NowPlaying') or @id='trackInfoContainer']";
MediaKeys.trackInfo = "//*[class='nowPlayingTopInfo__current' or contains(@class,'trackData')]";