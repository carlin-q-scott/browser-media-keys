self.port.on("MediaPlayPause", function(){
	if (playButton == null) return;
	if (playButton.getAttribute("style").indexOf("block") > -1) playButton.click();
	else {
		pauseButton.click();
	}
	self.port.emit("MediaPlayPause");
});

self.port.on("MediaNextTrack", function(){
	if (skipButton == null) return;
	skipButton.click();
	self.port.emit("MediaNextTrack");
});

self.port.on("MediaStop", function(){
	self.window.close();
	self.port.emit("MediaStop");
});