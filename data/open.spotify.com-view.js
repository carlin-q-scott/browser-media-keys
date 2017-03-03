/**
 * MediaKeys namespace.
 */
if (typeof MediaKeys == "undefined") var MediaKeys = {};

MediaKeys.playButton = "//button[contains(concat(' ', normalize-space(@class), ' '), ' spoticon-play-')]";
MediaKeys.pauseButton = "//button[contains(concat(' ', normalize-space(@class), ' '), ' spoticon-pause-')]";
MediaKeys.skipButton = "//button[contains(concat(' ', normalize-space(@class), ' '), ' spoticon-skip-forward-')]";
MediaKeys.previousButton = "//button[contains(concat(' ', normalize-space(@class), ' '), ' spoticon-skip-back-')]";
