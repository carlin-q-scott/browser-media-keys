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

	self.port.on("MediaPause", function(){
		console.log("pausing " + window.URL);
		var pauseButton = MediaKeys.GetSingleElementByXpath(MediaKeys.pauseButton)
		if (pauseButton != null)
		{
			pauseButton.click();
		}
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
            if (pauseButton == null) return;
	    	pauseButton.click();
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

	self.port.on("MediaStop", function(){
		var pauseButton = MediaKeys.GetSingleElementByXpath(MediaKeys.pauseButton, MediaKeys.basePlayer);
		if (pauseButton == null) return;
		pauseButton.click();
		self.port.emit("Stop");
	});

	if (MediaKeys.trackInfo && Notification.permission != 'denied')
	{
		function setupTrackInfoUpdates()
		{
			function notifyNewTrack(mutation)
			{
				new Notification("Now Playing", {
			    	body: MediaKeys.GetSingleElementByXpath(MediaKeys.trackInfo, MediaKeys.basePlayer).innerText 
			  	});
			}
			
			var currentTrackObservable;
			//setTimeout
			if (MediaKeys.trackInfoContainer) 
				currentTrackObservable = MediaKeys.GetSingleElementByXpath(MediaKeys.trackInfoContainer, MediaKeys.basePlayer);
			else 
				currentTrackObservable = MediaKeys.GetSingleElementByXpath(MediaKeys.trackInfo, MediaKeys.basePlayer);

			if (currentTrackObservable) //clear timer and finish setup

			var currentTrackObserver = new MutationObserver(notifyNewTrack);
			currentTrackObserver.observe(currentTrackObservable, {
				childList: true,
				characterData: true,
				subtree: true 
			});
		}

		if (Notification.permission == 'granted') setupTrackInfoUpdates();
		else Notification.requestPermission().then(function(result) { if (result == 'granted') setupTrackInfoUpdates(); });
	}
};

MediaKeys.Init();