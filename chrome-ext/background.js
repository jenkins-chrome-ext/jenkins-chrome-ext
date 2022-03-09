self.importScripts('../common/common.js');

function loadValues(obj, cb) {
	chrome.storage.local.get(obj, function(val) {
		cb(val);
	});
}

async function injectCss(tabId, file) {
	await chrome.scripting.insertCSS({target: {tabId}, files: [file]}, () => {});
}

async function injectJs(tabId, file, cb) {
	await chrome.scripting.executeScript({target: {tabId}, files: [file]}, () => {cb();});
}

async function onInjectsDone(tabId) {
	loadValues({
		[storageMyNameKey]: defaultMyName,
		[storageHighlightNamesKey]: defaultHighlightNames,
		[storageCommitUrlPrefixKey]: defaultCommitUrlPrefix,
		[storageGreenCommitMessagePatternKey]: defaultGreenCommitMessagePattern,
		[storageYellowCommitMessagePatternKey]: defaultYellowCommitMessagePattern,
		[storageRedCommitMessagePatternKey]: defaultRedCommitMessagePattern,
		[storageBlueCommitMessagePatternKey]: defaultBlueCommitMessagePattern,
		[storagePurpleCommitMessagePatternKey]: defaultPurpleCommitMessagePattern
	}, val => {
		chrome.tabs.sendMessage(
			tabId,
			{
				'type': 'jenkins-chrome-ext-go',
				'myName': val[storageMyNameKey] || '',
				'highlightNames': val[storageHighlightNamesKey] || '',
				'commitUrlPrefix': val[storageCommitUrlPrefixKey] || '',
				'greenCommitMessagePattern': val[storageGreenCommitMessagePatternKey] || '',
				'yellowCommitMessagePattern': val[storageYellowCommitMessagePatternKey] || '',
				'redCommitMessagePattern': val[storageRedCommitMessagePatternKey] || '',
				'blueCommitMessagePattern': val[storageBlueCommitMessagePatternKey] || '',
				'purpleCommitMessagePattern': val[storagePurpleCommitMessagePatternKey] || '',
			}
		);
	});
}

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
	chrome.storage.local.get(storageUrlPatternKey, function(val) {
		const urlPattern = val[storageUrlPatternKey] || defaultUrlPattern;
		if (changeInfo.status === 'complete' && urlPattern && (new RegExp(urlPattern)).test(tab.url)) {
			(async () => {
				await injectCss(tabId, '/content/jenkins-ext-style.css');
				await injectJs(tabId, '/common/common.js');
				await injectJs(tabId, '/content/jenkins-ext-common.js');
				await injectJs(tabId, '/content/jenkins-ext-commits.js');
				await injectJs(tabId, '/content/jenkins-ext-problems.js');
				await injectJs(tabId, '/content/jenkins-ext-content.js');
				onInjectsDone(tabId).then(()=>{});
			})();
		}
	});
	return true;
});
