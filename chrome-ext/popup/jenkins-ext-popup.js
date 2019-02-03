(function() {

	//let extId = 'cjmholedpdghokadoionhngnmfpeebnk';
	let storageUrlsPatternKey = 'jenkins-ext-urls-pattern';
	let storageMyNameKey = 'jenkins-ext-my-name';
	let storageHighlightNamesKey = 'jenkins-ext-highlight-names';
	let storageCommitUrlPrefixKey = 'jenkins-ext-commit-url-prefix';
	let defaultUrlsPattern = 'https?:\\/\\/mydtbld0101\\.hpeswlab\\.net:8888\\/jenkins\\S*\\/job\\/';
	let defaultMyName = '';
	let defaultHighlightCommiters = '';
	let defaultCommitUrlPrefix = 'https://github.houston.softwaregrp.net/MQM/mqm/commit/';

	function onPopupLoad() {
		document.getElementById('jenkins-ext-popup-cancel-button').addEventListener('click', onPopupCancel);
		document.getElementById('jenkins-ext-popup-save-button').addEventListener('click', onPopupSave);
		let urlsPattern = localStorage.getItem(storageUrlsPatternKey) !== null ? localStorage.getItem(storageUrlsPatternKey) : defaultUrlsPattern;
		let myName = localStorage.getItem(storageMyNameKey) !== null ? localStorage.getItem(storageMyNameKey) : defaultMyName;
		let highlightNames = localStorage.getItem(storageHighlightNamesKey) !== null ? localStorage.getItem(storageHighlightNamesKey) : defaultHighlightCommiters;
		let commitUrlPrefix = localStorage.getItem(storageCommitUrlPrefixKey) !== null ? localStorage.getItem(storageCommitUrlPrefixKey) : defaultCommitUrlPrefix;
		document.getElementById('urls-pattern-input').value = urlsPattern;
		document.getElementById('my-name-input').value = myName;
		document.getElementById('highlight-names-input').value = highlightNames;
		document.getElementById('commit-link-prefix-input').value = commitUrlPrefix;
	}

	function onPopupSave() {
		let urlsPattern = (document.getElementById('urls-pattern-input').value || '').trim();
		let myName = (document.getElementById('my-name-input').value || '').trim();
		let highlightNames = (document.getElementById('highlight-names-input').value || '').trim();
		let commitUrlPrefix = (document.getElementById('commit-link-prefix-input').value || '').trim();
		localStorage.setItem(storageUrlsPatternKey, urlsPattern);
		localStorage.setItem(storageMyNameKey, myName);
		localStorage.setItem(storageHighlightNamesKey, highlightNames);
		localStorage.setItem(storageCommitUrlPrefixKey, commitUrlPrefix);
		window.close();
	}

	function onPopupCancel() {
		window.close();
	}

	document.addEventListener('DOMContentLoaded', onPopupLoad, false);

})();
