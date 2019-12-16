(function() {

	function onPopupLoad() {
		document.getElementById('jenkins-ext-popup-cancel-button').addEventListener('click', onPopupCancel);
		document.getElementById('jenkins-ext-popup-save-button').addEventListener('click', onPopupSave);

		document.getElementById('url-pattern-input').value = loadValue(storageUrlPatternKey, defaultUrlPattern);
		document.getElementById('my-name-input').value = loadValue(storageMyNameKey, defaultMyName);
		document.getElementById('highlight-names-input').value = loadValue(storageHighlightNamesKey, defaultHighlightNames);
		document.getElementById('commit-link-prefix-input').value = loadValue(storageCommitUrlPrefixKey, defaultCommitUrlPrefix);
		document.getElementById('green-commit-msg-pattern-input').value = loadValue(storageGreenCommitMessagePatternKey, defaultGreenCommitMessagePattern);
		document.getElementById('yellow-commit-msg-pattern-input').value = loadValue(storageYellowCommitMessagePatternKey, defaultYellowCommitMessagePattern);
		document.getElementById('red-commit-msg-pattern-input').value = loadValue(storageRedCommitMessagePatternKey, defaultRedCommitMessagePattern);
		document.getElementById('blue-commit-msg-pattern-input').value = loadValue(storageBlueCommitMessagePatternKey, defaultBlueCommitMessagePattern);
		document.getElementById('purple-commit-msg-pattern-input').value = loadValue(storagePurpleCommitMessagePatternKey, defaultPurpleCommitMessagePattern);
	}

	function onPopupSave() {
		localStorage.setItem(storageUrlPatternKey, (document.getElementById('url-pattern-input').value || '').trim());
		localStorage.setItem(storageMyNameKey, (document.getElementById('my-name-input').value || '').trim());
		localStorage.setItem(storageHighlightNamesKey, (document.getElementById('highlight-names-input').value || '').trim());
		localStorage.setItem(storageCommitUrlPrefixKey, (document.getElementById('commit-link-prefix-input').value || '').trim());
		localStorage.setItem(storageGreenCommitMessagePatternKey, (document.getElementById('green-commit-msg-pattern-input').value || '').trim());
		localStorage.setItem(storageYellowCommitMessagePatternKey, (document.getElementById('yellow-commit-msg-pattern-input').value || '').trim());
		localStorage.setItem(storageRedCommitMessagePatternKey, (document.getElementById('red-commit-msg-pattern-input').value || '').trim());
		localStorage.setItem(storageBlueCommitMessagePatternKey, (document.getElementById('blue-commit-msg-pattern-input').value || '').trim());
		localStorage.setItem(storagePurpleCommitMessagePatternKey, (document.getElementById('purple-commit-msg-pattern-input').value || '').trim());
		window.close();
	}

	function onPopupCancel() {
		window.close();
	}

	document.addEventListener('DOMContentLoaded', onPopupLoad, false);

})();
