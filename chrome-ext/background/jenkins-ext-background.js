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

	function go(tabId) {
		chrome.tabs.sendMessage(
			tabId,
			{
				'type': 'jenkins-chrome-ext-go',
				'highlightCommiters': localStorage['highlightCommiters'] || ''
			}
		);
	}

	chrome.tabs.onUpdated.addListener(function (tabId, changeInfo, tab) {
		if (changeInfo.status === 'complete' && localStorage['urlsPattern'] && (new RegExp(localStorage['urlsPattern'])).test(tab.url)) {
			injectCss(tabId);
			injectJs(tabId, function() {
				go(tabId);
			});
		}
	});

})();
