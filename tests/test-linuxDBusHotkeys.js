if (require("sdk/system").platform == "linux") {
    var hotkeyWorker = require("../lib/linuxDBusHotkeys");

    exports["test register/de-register hotkeys"] = function (assert) {
        hotkeyWorker.postMessage("attach");
        assert.pass("successfully registered hotkeys");
        //Todo: something to test that the hotkeys are registered
        hotkeyWorker.postMessage("detach");
        assert.pass("successfully de-registered hotkeys");
    };

    require("sdk/test").run(exports);
}