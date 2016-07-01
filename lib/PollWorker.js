importScripts('resource://jid1-4gp7z3tkud3tzg-at-jetpack/lib/comm/Comm.js');
var gWkComm = new Comm.client.worker();
var { callInMainworker } = CommHelper.childworker;
var callInManager = Comm.callInX.bind(null, 'gWkComm', 'callInManager');
