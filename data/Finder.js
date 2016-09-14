/*eslint-env browser */

/**
 * MediaKeys namespace.
 */
if (typeof MediaKeys == "undefined") var MediaKeys = {};

MediaKeys.GetSingleElementByXpath = function(path, docXPath)
{
	var docElement;
	if (docXPath) docElement = MediaKeys.GetSingleElementByXpath(docXPath).contentDocument;
	else docElement = document;

	//console.log("looking for " + path + " on " + document.URL);
	return docElement.evaluate(path, docElement, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
};