/**
 * MediaKeys namespace.
 */
if (typeof MediaKeys == "undefined") var MediaKeys = {};

var baseXpath = "//div[contains(@class, 'player') and contains(@class, 'mini-player') and contains (@class, 'music')]";
MediaKeys.playButton = baseXpath + "//button[contains(@class, 'play-btn') and not(contains(@class, 'hidden'))]";
MediaKeys.pauseButton = baseXpath + "//button[contains(@class, 'pause-btn') and not(contains(@class, 'hidden'))]";
MediaKeys.skipButton = baseXpath + "//button[contains(@class, 'next-btn')]";
MediaKeys.previousButton = baseXpath + "//button[contains(@class, 'previous-btn')]";
