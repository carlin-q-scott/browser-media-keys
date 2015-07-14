/**
 * MediaKeys namespace.
 * 
 * Supports backwards compatibility with older Gecko key values.
 * See https://developer.mozilla.org/en-US/docs/Web/API/KeyboardEvent/key
 */
MediaKeys.Init = function()
{
	self.port.on("MediaPlay", function() {
		var playButton = MediaKeys.GetSingleElementByXpath(MediaKeys.playButton, MediaKeys.basePlayer);
		if (playButton == null) return;
		playButton.click();
		self.port.emit("Play");
	});

    self.port.on("MediaPlayPause", function() {
        var playButton = MediaKeys.GetSingleElementByXpath(MediaKeys.playButton, MediaKeys.basePlayer);
        if (playButton != null)
        {
            playButton.click();
            self.port.emit("Play");
        }
        else
        {
            var pauseButton = MediaKeys.GetSingleElementByXpath(MediaKeys.pauseButton, MediaKeys.basePlayer);
            if (pauseButton != null) pauseButton.click();
            else return;
            self.port.emit("Pause");
        }
	});

	self.port.on("MediaTrackNext", function() {
        var skipButton = MediaKeys.GetSingleElementByXpath(MediaKeys.skipButton, MediaKeys.basePlayer);
        if (skipButton == null) return;
        skipButton.click();
        self.port.emit("Next");
    });

    self.port.on("MediaTrackPrevious", function() {
        var previousButton = MediaKeys.GetSingleElementByXpath(MediaKeys.previousButton, MediaKeys.basePlayer);
        if (previousButton == null) return;
        previousButton.click();
        self.port.emit("Previous");
	});

	var pause = function() {
		return function(){
			var pauseButton = MediaKeys.GetSingleElementByXpath(MediaKeys.pauseButton, MediaKeys.basePlayer);
			if (pauseButton == null) return;
			pauseButton.click();
			self.port.emit("Pause");
		};
	};
	self.port.on("MediaPause", pause());
	self.port.on("MediaStop", pause());
};

MediaKeys.Init();