(function() {

	//let extId = 'cjmholedpdghokadoionhngnmfpeebnk';
	let storageUrlsPatternKey = 'jenkins-ext-urls-pattern';
	let storageMyNameKey = 'jenkins-ext-my-name';
	let storageHighlightNamesKey = 'jenkins-ext-highlight-names';
	let storageCommitLinkPrefixKey = 'jenkins-ext-commit-link-prefix';
	let defaultUrlsPattern = 'https?:\\/\\/mydtbld0101\\.hpeswlab\\.net:8888\\/jenkins\\S*\\/job\\/';
	let defaultMyName = '';
	let defaultHighlightNames = '';
	let defaultCommitLinkPrefix = 'http://mydtbld0005.hpeswlab.net:7990/projects/MQM/repos/mqm/commits/';
	let urlsPattern = localStorage.getItem(storageUrlsPatternKey) !== null ? localStorage.getItem(storageUrlsPatternKey) : defaultUrlsPattern;
	let myName = localStorage.getItem(storageMyNameKey) !== null ? localStorage.getItem(storageMyNameKey) : defaultMyName;
	let highlightNames = localStorage.getItem(storageHighlightNamesKey) !== null ? localStorage.getItem(storageHighlightNamesKey) : defaultHighlightNames;
	let commitLinkPrefix = localStorage.getItem(storageCommitLinkPrefixKey) !== null ? localStorage.getItem(storageCommitLinkPrefixKey) : defaultCommitLinkPrefix;

	function injectCss(tabId) {
		chrome.tabs.insertCSS(
			tabId,
			{
				file: '/content/jenkins-ext-content.css'
			},
			function () {}
		);
	}

	function injectJs(tabId, cb) {
		chrome.tabs.executeScript(
			tabId,
			{
				file: '/content/jenkins-ext-content.js'
			},
			function () {
				cb();
			}
		);
	}

	chrome.tabs.onUpdated.addListener(function (tabId, changeInfo, tab) {
		if (changeInfo.status === 'complete' && urlsPattern && (new RegExp(urlsPattern)).test(tab.url)) {
			injectCss(tabId);
			injectJs(tabId, function() {
				chrome.tabs.sendMessage(
					tabId,
					{
						'type': 'jenkins-chrome-ext-go',
						'myName': myName || '',
						'highlightNames': highlightNames || '',
						'commitLinkPrefix': commitLinkPrefix || ''
					}
				);
			});
		}
	});

})();
