if (require("sdk/system").platform == "darwin") {
	var { setTimeout } = require("sdk/timers");
	var tabs = require("sdk/tabs");
	var notifications = require("sdk/notifications");
	tabs[0].url = "about:blank";

	exports["test register/de-register hotkeys"] = function (assert, done) {
		let hotkeyWorker = require("../lib/darwinKeys.js");

		new Promise(function(resolve,reject){
			//hotkeyWorker.onerror = reject;
			hotkeyWorker.postMessage("attach");
			setTimeout(resolve, 500);
		}).then(function(){ 
			return new Promise(function (resolve, reject) {
				//hotkeyWorker.onerror = reject;
				assert.pass("successfully registered hotkeys");
				
				hotkeyWorker.addEventListener(function(event){
					assert.equal("MediaPlayPause", event.data, "emmit media play/pause event");
					resolve();
				});
				notifications.notify({ text: "press play/pause button" });
			});
		}).then(function(){ 
			return new Promise(function(resolve){
				hotkeyWorker.postMessage("detach");
				setTimeout(resolve, 500);
			});
		}).then(function(){
			assert.pass("successfully de-registered hotkeys");
			done();
		}).catch(function(error){
			assert.fail(error);
			done();
		})
	};

	require("sdk/test").run(exports);
}