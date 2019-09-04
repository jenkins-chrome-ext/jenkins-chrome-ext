(function() {

	//let extId = 'cjmholedpdghokadoionhngnmfpeebnk';
	let storageUrlPatternKey = 'jenkins-ext-url-pattern';
	let storageMyNameKey = 'jenkins-ext-my-name';
	let storageHighlightNamesKey = 'jenkins-ext-highlight-names';
	let storageCommitUrlPrefixKey = 'jenkins-ext-commit-url-prefix';
	let defaultUrlPattern = `https?:\\/\\/jenkins\\.almoctane\\.com\\/\\S*job\\/`;
	let defaultMyName = '';
	let defaultHighlightCommiters = '';
	let defaultCommitUrlPrefix = 'https://github.houston.softwaregrp.net/MQM/mqm/commit/';

	function onPopupLoad() {
		document.getElementById('jenkins-ext-popup-cancel-button').addEventListener('click', onPopupCancel);
		document.getElementById('jenkins-ext-popup-save-button').addEventListener('click', onPopupSave);
		let urlPattern = localStorage.getItem(storageUrlPatternKey) !== null ? localStorage.getItem(storageUrlPatternKey) : defaultUrlPattern;
		let myName = localStorage.getItem(storageMyNameKey) !== null ? localStorage.getItem(storageMyNameKey) : defaultMyName;
		let highlightNames = localStorage.getItem(storageHighlightNamesKey) !== null ? localStorage.getItem(storageHighlightNamesKey) : defaultHighlightCommiters;
		let commitUrlPrefix = localStorage.getItem(storageCommitUrlPrefixKey) !== null ? localStorage.getItem(storageCommitUrlPrefixKey) : defaultCommitUrlPrefix;
		document.getElementById('url-pattern-input').value = urlPattern;
		document.getElementById('my-name-input').value = myName;
		document.getElementById('highlight-names-input').value = highlightNames;
		document.getElementById('commit-link-prefix-input').value = commitUrlPrefix;
	}

	function onPopupSave() {
		let urlPattern = (document.getElementById('url-pattern-input').value || '').trim();
		let myName = (document.getElementById('my-name-input').value || '').trim();
		let highlightNames = (document.getElementById('highlight-names-input').value || '').trim();
		let commitUrlPrefix = (document.getElementById('commit-link-prefix-input').value || '').trim();
		localStorage.setItem(storageUrlPatternKey, urlPattern);
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
