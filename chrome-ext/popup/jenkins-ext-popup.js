(function() {

	let localStorageHighlightCommitersKey = 'jenkins-ext-highlight-commiters';
	let highlightCommiters = '';

	function onDomLoaded() {
		document.getElementById('jenkins-ext-popup-cancel-button').addEventListener('click', onPopupCancel);
		document.getElementById('jenkins-ext-popup-save-button').addEventListener('click', onPopupSave);
		highlightCommiters = localStorage.getItem(localStorageHighlightCommitersKey) || '';
		document.getElementById('highlight-commiters-input').value = highlightCommiters;
	}

	function onPopupCancel() {
		window.close();
	}

	function sendHighlightCommitersToContentScript(tabs) {
		tabs.forEach(tab => {
			chrome.tabs.sendMessage(
				tab.id,
				{
					'type': 'jenkins-chrome-ext-highlight-commiters',
					'msg': highlightCommiters
				}
			);
			window.close();
		});
	}

	function onPopupSave() {
		highlightCommiters = document.getElementById('highlight-commiters-input').value || '';
		localStorage.setItem(localStorageHighlightCommitersKey, highlightCommiters);
		chrome.tabs.query({currentWindow: true,	active: true}, sendHighlightCommitersToContentScript);
	}

	document.addEventListener('DOMContentLoaded', onDomLoaded, false);

})();
