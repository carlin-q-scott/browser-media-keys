/**
 * MediaKeys namespace.
 */
MediaKeys.Init = function(undefined)
{
	self.port.on("MediaPlayPause", function(){
		var playButton = GetSingleElementByXpath(MediaKeys.playButton);
		if (playButton == null) return;
		if (playButton.getAttribute("style").indexOf("display: none") < 0)
		{
			playButton.click();
		}
		else
		{
			GetSingleElementByXpath(MediaKeys.pauseButton).click();
		}
		self.port.emit("MediaPlayPause");
	});

	self.port.on("MediaNextTrack", function(){
		var nextButton = GetSingleElementByXpath(MediaKeys.nextButton);
		if (nextButton == null) return;
		nextButton.click();
		self.port.emit("MediaNextTrack");
	});

	self.port.on("MediaPreviousTrack", function(){
		var previousButton = GetSingleElementByXpath(MediaKeys.previousButton);
		if (previousButton == null) return;
		previousButton.click();
		self.port.emit("MediaPreviousTrack");
	});
	
	self.port.on("MediaStop", function(){
		var pauseButton = GetSingleElementByXpath(MediaKeys.pauseButton);
		if (pauseButton == null) return;
		pauseButton.click();
		self.port.emit("MediaStop");
	});
}

MediaKeys.Init();