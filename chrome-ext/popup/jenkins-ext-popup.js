(function() {

	//let extId = 'cjmholedpdghokadoionhngnmfpeebnk';
	let storageUrlsPatternKey = 'jenkins-ext-urls-pattern';
	let storageHighlightCommitersKey = 'jenkins-ext-highlight-commiters';
	let storageCommitLinkPrefixKey = 'jenkins-ext-commit-link-prefix';
	let defaultUrlsPattern = 'https?:\\/\\/mydtbld0101\\.hpeswlab\\.net:8888\\/jenkins\\S*\\/job\\/';
	let defaultHighlightCommiters = '';
	let defaultCommitLinkPrefix = 'http://mydtbld0005.hpeswlab.net:7990/projects/MQM/repos/mqm/commits/';

	function onPopupLoad() {
		document.getElementById('jenkins-ext-popup-cancel-button').addEventListener('click', onPopupCancel);
		document.getElementById('jenkins-ext-popup-save-button').addEventListener('click', onPopupSave);
		let urlsPattern = localStorage.getItem(storageUrlsPatternKey) !== null ? localStorage.getItem(storageUrlsPatternKey) : defaultUrlsPattern;
		let highlightCommiters = localStorage.getItem(storageHighlightCommitersKey) !== null ? localStorage.getItem(storageHighlightCommitersKey) : defaultHighlightCommiters;
		let commitLinkPrefix = localStorage.getItem(storageCommitLinkPrefixKey) !== null ? localStorage.getItem(storageCommitLinkPrefixKey) : defaultCommitLinkPrefix;
		document.getElementById('urls-pattern-input').value = urlsPattern;
		document.getElementById('highlight-commiters-input').value = highlightCommiters;
		document.getElementById('commit-link-prefix-input').value = commitLinkPrefix;
	}

	function onPopupSave() {
		let urlsPattern = document.getElementById('urls-pattern-input').value || '';
		let highlightCommiters = document.getElementById('highlight-commiters-input').value || '';
		let commitLinkPrefix = document.getElementById('commit-link-prefix-input').value || '';
		localStorage.setItem(storageUrlsPatternKey, urlsPattern);
		localStorage.setItem(storageHighlightCommitersKey, highlightCommiters);
		localStorage.setItem(storageCommitLinkPrefixKey, commitLinkPrefix);
		window.close();
	}

	function onPopupCancel() {
		window.close();
	}

	document.addEventListener('DOMContentLoaded', onPopupLoad, false);

})();
