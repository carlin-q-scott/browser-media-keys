var getElementByXpath = function (path) {
 return document.evaluate(path, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
};

self.port.on("TogglePlay", function(){
	var playButton = getElementByXpath("//div[@class='playButton']");
	if (playButton == null) return;
	if (playButton.getAttribute("style").indexOf("block") > -1) playButton.click();
	else {
		var pauseButton = getElementByXpath("//div[@class='pauseButton']");
		pauseButton.click();
	}
	self.port.emit("PlayToggled");
});