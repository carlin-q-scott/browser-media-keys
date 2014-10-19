var getElementByXpath = function (path) {
 return document.evaluate(path, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
};

var playButtonXpath = "//div[@class='playButton']";
var pauseButtonXpath = "//div[@class='skipButton']";

self.port.on("MediaPlayPause", function(){
	var playButton = getElementByXpath(playButtonXpath);
	if (playButton == null) return;
	if (playButton.getAttribute("style").indexOf("block") > -1) playButton.click();
	else {
		var pauseButton = getElementByXpath("//div[@class='pauseButton']");
		pauseButton.click();
	}
	self.port.emit("MediaPlayPause");
});

self.port.on("MediaNextTrack", function(){
	var skipButton = getElementByXpath(pauseButtonXpath);
	if (skipButton == null) return;
	skipButton.click();
	self.port.emit("MediaNextTrack");
});

self.port.on("MediaStop", function(){
	self.window.close();
	self.port.emit("MediaNextTrack");
});