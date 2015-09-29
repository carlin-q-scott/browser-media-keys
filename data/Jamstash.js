/**
 * MediaKeys namespace.
 */
if (typeof MediaKeys == "undefined") var MediaKeys = {};

console.log('Jamstash registered');
MediaKeys.Init = function()
{
	function simulateClick(el){
		var etype = 'click';
	  if (el.fireEvent) {
		el.fireEvent('on' + etype);
	  } else {
		var evObj = document.createEvent('Events');
		evObj.initEvent(etype, true, false);
		el.dispatchEvent(evObj);
	  }
	}
    var pageScript = document.createElement("script");

    var attachPageScript = function(){
        pageScript.id = "media-keys";
        pageScript.src = self.options.pageScript;
        document.body.appendChild(pageScript);
    };
    attachPageScript();
	
    self.port.on("attach", attachPageScript);
    self.port.on("MediaPlayPause", function(){
		var playPauseButton = document.getElementsByClassName('PlayTrack')[0];
        var isPlaying = playPauseButton.style.display === 'none';
        if (isPlaying) {
            playPauseButton = document.getElementsByClassName('PauseTrack')[0];
        }
		simulateClick(playPauseButton);
	});
    self.port.on("MediaTrackNext", function(){ 
		var nextButton = document.getElementById('NextTrack');
        simulateClick(nextButton);
	});
    self.port.on("MediaTrackPrevious", function(){ 
		var prevButton = document.getElementById('PreviousTrack');
        simulateClick(prevButton);
	});

    window.addEventListener("message", function(event) {
		console.log("addeventlistener");
        self.port.emit(event.data);
    });

    self.port.on("detach", function(){
        if (document.body && document.body.contains(pageScript)) document.body.removeChild(pageScript);
    });
};

MediaKeys.Init();



