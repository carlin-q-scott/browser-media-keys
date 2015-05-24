/**
 * MediaKeys namespace.
 */
MediaKeys.Init = function(undefined)
{
	self.port.on("MediaPlay", function(){
		var playButton = MediaKeys.GetSingleElementByXpath(MediaKeys.playButton);
		if (playButton != null)
		{
			playButton.click();
			//self.port.emit("Broadcast", "MediaPause");
		}
	});
	
	self.port.on("MediaPause", function(){
		console.log("pausing " + window.URL);
		var pauseButton = MediaKeys.GetSingleElementByXpath(MediaKeys.pauseButton)
		if (pauseButton != null)
		{
			pauseButton.click();
		}
	});
		
	self.port.on("MediaPlayPause", function(){
		var playButton = MediaKeys.GetSingleElementByXpath(MediaKeys.playButton);
		if (playButton != null)
		{
			playButton.click();
			//self.port.emit("Broadcast", "MediaPause");
		}
		else
		{
			var pauseButton = MediaKeys.GetSingleElementByXpath(MediaKeys.pauseButton)
			if (pauseButton != null) pauseButton.click();
		}
	});

	self.port.on("MediaNextTrack", function(){
		var skipButton = MediaKeys.GetSingleElementByXpath(MediaKeys.skipButton);
		if (skipButton == null) return;
		skipButton.click();
	});

	self.port.on("MediaPreviousTrack", function(){
		var previousButton = MediaKeys.GetSingleElementByXpath(MediaKeys.previousButton);
		if (previousButton == null) return;
		previousButton.click();
	});

	self.port.on("MediaStop", function(){
		var pauseButton = MediaKeys.GetSingleElementByXpath(MediaKeys.pauseButton);
		if (pauseButton == null) return;
		pauseButton.click();
	});
}

MediaKeys.Init();