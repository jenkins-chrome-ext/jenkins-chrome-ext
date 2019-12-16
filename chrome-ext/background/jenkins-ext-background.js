(function() {

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
		const urlPattern = loadValue(storageUrlPatternKey, defaultUrlPattern);
		if (changeInfo.status === 'complete' && urlPattern && (new RegExp(urlPattern)).test(tab.url)) {
			injectCss(tabId);
			injectJs(tabId, function() {
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
			});
		}
	});

})();
