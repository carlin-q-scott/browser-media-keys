/**
 * MediaKeys namespace.
 */
MediaKeys.Init = function(undefined)
{
	self.port.on("MediaPlayPause", function(){
		if (MediaKeys.playButton == null) return;
		if (MediaKeys.playButton.getAttribute("style").indexOf("block") > -1) MediaKeys.playButton.click();
		else
		{
			MediaKeys.pauseButton.click();
		}
		self.port.emit("MediaPlayPause");
	});

	self.port.on("MediaNextTrack", function(){
		if (MediaKeys.skipButton == null) return;
		MediaKeys.skipButton.click();
		self.port.emit("MediaNextTrack");
	});

	self.port.on("MediaStop", function(){
		if (MediaKeys.pauseButton == null) return;
		MediaKeys.pauseButton.click();
		self.port.emit("MediaStop");
	});
}

MediaKeys.Init();