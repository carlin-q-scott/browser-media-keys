/**
 * MediaKeys namespace.
 * 
 * Supports backwards compatibility with older Gecko key values.
 * See https://developer.mozilla.org/en-US/docs/Web/API/KeyboardEvent/key
 */
MediaKeys.Init = function(undefined)
{
	self.port.on("MediaPlay", function() {
		var playButton = MediaKeys.GetSingleElementByXpath(MediaKeys.playButton);
		if (playButton == null) return;
		playButton.click();
		self.port.emit("MediaPlay");
	});

	var playPause = function(keyId){
		return function(){
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
			self.port.emit(keyId);
		};
	};
	self.port.on("MediaPlayPause", playPause("MediaPlayPause"));

	var nextTrack = function(keyId) {
		return function(){
			var skipButton = MediaKeys.GetSingleElementByXpath(MediaKeys.skipButton);
			if (skipButton == null) return;
			skipButton.click();
			self.port.emit(keyId);
		};
	};
	self.port.on("MediaNextTrack", nextTrack("MediaNextTrack"));
	self.port.on("MediaTrackNext", nextTrack("MediaTrackNext")); //Gecko 37+

	var previousTrack = function(keyId) {
		return function(){
			var previousButton = MediaKeys.GetSingleElementByXpath(MediaKeys.previousButton);
			if (previousButton == null) return;
			previousButton.click();
			self.port.emit(keyId);
		};
	};
	self.port.on("MediaPreviousTrack", previousTrack("MediaPreviousTrack"));
	self.port.on("MediaTrackPrevious", previousTrack("MediaTrackPrevious")); //Gecko 37+

	var pause = function(keyId) {
		return function(){
			var pauseButton = MediaKeys.GetSingleElementByXpath(MediaKeys.pauseButton);
			if (pauseButton == null) return;
			pauseButton.click();
			self.port.emit("MediaStop");
		};
	};
	self.port.on("MediaPause", pause("MediaPause"));
	self.port.on("MediaStop", pause("MediaStop"));
}

MediaKeys.Init();