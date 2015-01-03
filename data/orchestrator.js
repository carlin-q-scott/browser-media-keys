/**
 * MediaKeys namespace.
 */
MediaKeys.Init = function(undefined)
{
	self.port.on("MediaPlayPause", function(){
		var playButton = MediaKeys.GetSingleElementByXpath(MediaKeys.playButton);
		if (playButton != null)
		{
			playButton.click();
		}
		else
		{
			var pauseButton = MediaKeys.GetSingleElementByXpath(MediaKeys.pauseButton)
			if (pauseButton != null) pauseButton.click();
			else return;
		}
		self.port.emit("MediaPlayPause");
	});

	self.port.on("MediaNextTrack", function(){
		var skipButton = MediaKeys.GetSingleElementByXpath(MediaKeys.skipButton);
		if (skipButton == null) return;
		skipButton.click();
		self.port.emit("MediaNextTrack");
	});

	self.port.on("MediaPreviousTrack", function(){
		var previousButton = MediaKeys.GetSingleElementByXpath(MediaKeys.previousButton);
		if (previousButton == null) return;
		previousButton.click();
		self.port.emit("MediaPreviousTrack");
	});

	self.port.on("MediaStop", function(){
		var pauseButton = MediaKeys.GetSingleElementByXpath(MediaKeys.pauseButton);
		if (pauseButton == null) return;
		pauseButton.click();
		self.port.emit("MediaStop");
	});
}

MediaKeys.Init();