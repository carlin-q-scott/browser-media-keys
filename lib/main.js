var supportedPageDomains = ["pandora.com", "tidalhifi.com", "youtube.com"];

//attach content scripts to appropriate websites
require("hotkeyManager").RegisterContentScripts(supportedPageDomains);