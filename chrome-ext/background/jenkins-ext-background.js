function injectCss(tabId, file) {
	chrome.tabs.insertCSS(tabId, {file}, () => {});
}

function injectJs(tabId, file, cb) {
	chrome.tabs.executeScript(tabId, {file}, () => {cb();});
}

function onInjectsDone(tabId) {
	const myName = loadValue(storageMyNameKey, defaultMyName);
	const highlightNames = loadValue(storageHighlightNamesKey, defaultHighlightNames);
	const commitUrlPrefix = loadValue(storageCommitUrlPrefixKey, defaultCommitUrlPrefix);
	const greenCommitMessagePattern = loadValue(storageGreenCommitMessagePatternKey, defaultGreenCommitMessagePattern);
	const yellowCommitMessagePattern = loadValue(storageYellowCommitMessagePatternKey, defaultYellowCommitMessagePattern);
	const redCommitMessagePattern = loadValue(storageRedCommitMessagePatternKey, defaultRedCommitMessagePattern);
	const blueCommitMessagePattern = loadValue(storageBlueCommitMessagePatternKey, defaultBlueCommitMessagePattern);
	const purpleCommitMessagePattern = loadValue(storagePurpleCommitMessagePatternKey, defaultPurpleCommitMessagePattern);
	chrome.tabs.sendMessage(
	tabId,
	{
		'type': 'jenkins-chrome-ext-go',
		'myName': myName || '',
		'highlightNames': highlightNames || '',
		'commitUrlPrefix': commitUrlPrefix || '',
		'greenCommitMessagePattern': greenCommitMessagePattern || '',
		'yellowCommitMessagePattern': yellowCommitMessagePattern || '',
		'redCommitMessagePattern': redCommitMessagePattern || '',
		'blueCommitMessagePattern': blueCommitMessagePattern || '',
		'purpleCommitMessagePattern': purpleCommitMessagePattern || '',
	}
	);
}

chrome.tabs.onUpdated.addListener(function (tabId, changeInfo, tab) {
	const urlPattern = loadValue(storageUrlPatternKey, defaultUrlPattern);
	if (changeInfo.status === 'complete' && urlPattern && (new RegExp(urlPattern)).test(tab.url)) {
		injectCss(tabId, '/content/jenkins-ext-style.css');
		injectJs(tabId, '/content/jenkins-ext-common.js', () => {
		injectJs(tabId, '/content/jenkins-ext-commits.js', () => {
		injectJs(tabId, '/content/jenkins-ext-problems.js', () => {
		injectJs(tabId, '/content/jenkins-ext-content.js', () => {
		onInjectsDone(tabId);
		});});});});
	}
});
