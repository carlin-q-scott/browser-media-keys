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
		paused: 2,
		buffering: 3
	};
	
	var playerElement = function(){
		return unsafeWindow.document.getElementById("movie_player");
	}
	
	var playIfNecesary = function(player, state)
	{
		switch(state)
		{
			case PlayerStates.unstarted:
			case PlayerStates.ended:
			case PlayerStates.paused:
				player.playVideo();
				//self.port.emit("Broadcast", "MediaPause");
				return true;
		}
		return false;
	}

	var pauseIfNecesary = function(player, state)
	{
		switch(state)
		{
			case PlayerStates.playing:
			case PlayerStates.buffering:
				player.pauseVideo();
				return true;
		}
		return false;
	}
	
	self.port.on("MediaPlay"), function(){
		var player = playerElement();
		var status = player.getPlayerState();
		playIfNecesary(player, status);
	}

	self.port.on("MediaPause"), function(){
		var player = playerElement();
		var status = player.getPlayerState();
		pauseIfNecesary(player, status);
	}
	
	self.port.on("MediaPlayPause", function(){
		var player = playerElement();
		var status = player.getPlayerState();
		if (!playIfNecesary(player, status)) pauseIfNecesary(player, status);
	});

	self.port.on("MediaNextTrack", function(){
		playerElement().nextVideo()
	});

	self.port.on("MediaPreviousTrack", function(){
		playerElement().previousVideo()
	});

	self.port.on("MediaStop", function(){
		playerElement().stopVideo()
	});
	
	//automatically pause other players while playing a video and resume them when done
	var latestState;
	window.setInterval(function(){
		var state = playerElement().getPlayerState();
		if (state != latestState)
		{
			latestState = state;
			switch(state)
			{
				case PlayerStates.playing:
					self.port.emit("Broadcast", "MediaPause");
					break;
				case PlayerStates.ended:
					self.port.emit("Broadcast", "MediaPlay");
					break;
			}
		}
	}, 1500);
}

MediaKeys.Init();