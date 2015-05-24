/**
 * MediaKeys namespace.
 */
if (typeof MediaKeys == "undefined") var MediaKeys = {};

MediaKeys.Init = function(undefined)
{
	var PlayerStates = {
		unstarted: -1,
		ended: 0,
		playing: 1,
		paused: 2
	};
	
	self.port.on("MediaPlayPause", function(){
		var player = unsafeWindow.document.getElementById("movie_player");
		var status = player.getPlayerState();
		if (status != PlayerStates.playing)
		{
			player.playVideo();
		}
		else
		{
			player.pauseVideo();
		}
		self.port.emit("MediaPlayPause");
	});

	self.port.on("MediaNextTrack", function(){
		unsafeWindow.document.getElementById("movie_player").nextVideo()
	});

	self.port.on("MediaPreviousTrack", function(){
		unsafeWindow.document.getElementById("movie_player").previousVideo()
	});

	self.port.on("MediaStop", function(){
		unsafeWindow.document.getElementById("movie_player").stopVideo()
	});
};

MediaKeys.Init();