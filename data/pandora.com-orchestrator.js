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
			MediaKeys.GetSingleElementByXpath(MediaKeys.pauseButton).click();
		}
		self.port.emit("MediaPlayPause");
	});

	self.port.on("MediaNextTrack", function(){
		var skipButton = MediaKeys.GetSingleElementByXpath(MediaKeys.skipButton);
		//if (skipButton == null) return;
		skipButton.click();
		self.port.emit("MediaNextTrack");
	});

	self.port.on("MediaStop", function(){
		var pauseButton = MediaKeys.GetSingleElementByXpath(MediaKeys.pauseButton);
		if (pauseButton == null) return;
		pauseButton.click();
		self.port.emit("MediaStop");
	});
}

MediaKeys.Init();