/**
 * MediaKeys namespace.
 */
if (typeof MediaKeys == "undefined") var MediaKeys = {};

MediaKeys.playButton = GetSingleElementByXpath("//div[@class='playButton']");
MediaKeys.pauseButton = GetSingleElementByXpath("//div[@class='pauseButton']");
MediaKeys.skipButton = GetSingleElementByXpath("//div[@class='skipButton']");