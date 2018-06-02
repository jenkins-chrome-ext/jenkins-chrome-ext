(function() {

	let storageUrlsPatternKey = 'jenkins-ext-urls-pattern';
	let storageHighlightCommitersKey = 'jenkins-ext-highlight-commiters';

	function onPopupLoad() {
		document.getElementById('jenkins-ext-popup-cancel-button').addEventListener('click', onPopupCancel);
		document.getElementById('jenkins-ext-popup-save-button').addEventListener('click', onPopupSave);
		let defaultUrlsPattern = 'https?:\\/\\/mydtbld0101\\.hpeswlab\\.net:8888\\/jenkins\\S*\\/job\\/';
		let defaultHighlightCommiters = '';
		let urlsPattern = localStorage.getItem(storageUrlsPatternKey) || defaultUrlsPattern;
		let highlightCommiters = localStorage.getItem(storageHighlightCommitersKey) || defaultHighlightCommiters;
		document.getElementById('urls-pattern-input').value = urlsPattern;
		document.getElementById('highlight-commiters-input').value = highlightCommiters;
	}

	function onPopupSave() {
		let urlsPattern = document.getElementById('urls-pattern-input').value || '';
		let highlightCommiters = document.getElementById('highlight-commiters-input').value || '';
		localStorage.setItem(storageUrlsPatternKey, urlsPattern);
		localStorage.setItem(storageHighlightCommitersKey, highlightCommiters);
		window.close();
	}

	function onPopupCancel() {
		window.close();
	}

	document.addEventListener('DOMContentLoaded', onPopupLoad, false);

})();
