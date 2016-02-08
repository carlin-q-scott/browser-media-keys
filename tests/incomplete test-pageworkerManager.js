/**
 * Created by Carlin on 2/7/2016.
 */
var pwm = require('pageWorkerManager.js');

exports["disabled AttachWorkerToPage setup of page script detach"] = function(assert, done) {
    //cannot access private function
};

require("sdk/test").run(exports);