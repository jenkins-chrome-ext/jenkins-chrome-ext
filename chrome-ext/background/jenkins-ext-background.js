(function() {

	let extId = 'cjmholedpdghokadoionhngnmfpeebnk';
	let storageUrlsPatternKey = 'jenkins-ext-urls-pattern';
	let storageHighlightCommitersKey = 'jenkins-ext-highlight-commiters';

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
		if (changeInfo.status === 'complete' && localStorage[storageUrlsPatternKey] && (new RegExp(localStorage[storageUrlsPatternKey])).test(tab.url)) {
			injectCss(tabId);
			injectJs(tabId, function() {
				chrome.tabs.sendMessage(
					tabId,
					{
						'type': 'jenkins-chrome-ext-go',
						'highlightCommiters': localStorage[storageHighlightCommitersKey] || ''
					}
				);
			});
		}
	});

})();
