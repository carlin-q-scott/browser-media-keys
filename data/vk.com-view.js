/**
 * MediaKeys namespace.
 */
if (typeof MediaKeys == "undefined") var MediaKeys = {};

MediaKeys.playButton = MediaKeys.pauseButton = "//button[contains(@class,'top_audio_player_btn') and contains(@class,'top_audio_player_play') and contains(@class,'_top_audio_player_play')]";
MediaKeys.skipButton = "//button[contains(@class,'top_audio_player_btn') and contains(@class,'top_audio_player_next')]";
MediaKeys.previousButton = "//button[contains(@class,'top_audio_player_btn') and contains(@class,'top_audio_player_prev')]";
