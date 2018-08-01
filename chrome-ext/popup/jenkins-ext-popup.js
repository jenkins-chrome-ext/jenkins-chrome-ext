(function() {

	//let extId = 'cjmholedpdghokadoionhngnmfpeebnk';
	let storageUrlsPatternKey = 'jenkins-ext-urls-pattern';
	let storageMyNameKey = 'jenkins-ext-my-name';
	let storageHighlightNamesKey = 'jenkins-ext-highlight-names';
	let storageCommitLinkPrefixKey = 'jenkins-ext-commit-link-prefix';
	let defaultUrlsPattern = 'https?:\\/\\/mydtbld0101\\.hpeswlab\\.net:8888\\/jenkins\\S*\\/job\\/';
	let defaultMyName = '';
	let defaultHighlightCommiters = '';
	let defaultCommitLinkPrefix = 'http://mydtbld0005.hpeswlab.net:7990/projects/MQM/repos/mqm/commits/';

	function onPopupLoad() {
		document.getElementById('jenkins-ext-popup-cancel-button').addEventListener('click', onPopupCancel);
		document.getElementById('jenkins-ext-popup-save-button').addEventListener('click', onPopupSave);
		let urlsPattern = localStorage.getItem(storageUrlsPatternKey) !== null ? localStorage.getItem(storageUrlsPatternKey) : defaultUrlsPattern;
		let myName = localStorage.getItem(storageMyNameKey) !== null ? localStorage.getItem(storageMyNameKey) : defaultMyName;
		let highlightNames = localStorage.getItem(storageHighlightNamesKey) !== null ? localStorage.getItem(storageHighlightNamesKey) : defaultHighlightCommiters;
		let commitLinkPrefix = localStorage.getItem(storageCommitLinkPrefixKey) !== null ? localStorage.getItem(storageCommitLinkPrefixKey) : defaultCommitLinkPrefix;
		document.getElementById('urls-pattern-input').value = urlsPattern;
		document.getElementById('my-name-input').value = myName;
		document.getElementById('highlight-names-input').value = highlightNames;
		document.getElementById('commit-link-prefix-input').value = commitLinkPrefix;
	}

	function onPopupSave() {
		let urlsPattern = (document.getElementById('urls-pattern-input').value || '').trim();
		let myName = (document.getElementById('my-name-input').value || '').trim();
		let highlightNames = (document.getElementById('highlight-names-input').value || '').trim();
		let commitLinkPrefix = (document.getElementById('commit-link-prefix-input').value || '').trim();
		localStorage.setItem(storageUrlsPatternKey, urlsPattern);
		localStorage.setItem(storageMyNameKey, myName);
		localStorage.setItem(storageHighlightNamesKey, highlightNames);
		localStorage.setItem(storageCommitLinkPrefixKey, commitLinkPrefix);
		window.close();
	}

	function onPopupCancel() {
		window.close();
	}

	document.addEventListener('DOMContentLoaded', onPopupLoad, false);

})();
