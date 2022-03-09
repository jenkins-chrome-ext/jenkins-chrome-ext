(function() {

	const storageUrlPatternKey = 'jenkins-ext-url-pattern';
	const storageMyNameKey = 'jenkins-ext-my-name';
	const storageHighlightNamesKey = 'jenkins-ext-highlight-names';
	const storageCommitUrlPrefixKey = 'jenkins-ext-commit-url-prefix';
	const storageGreenCommitMessagePatternKey = 'jenkins-ext-green-commit-message-pattern';
	const storageYellowCommitMessagePatternKey = 'jenkins-ext-yellow-commit-message-pattern';
	const storageRedCommitMessagePatternKey = 'jenkins-ext-red-commit-message-pattern';
	const storageBlueCommitMessagePatternKey = 'jenkins-ext-blue-commit-message-pattern';
	const storagePurpleCommitMessagePatternKey = 'jenkins-ext-purple-commit-message-pattern';
	const defaultUrlPattern = `https?:\\/\\/jenkins\\.almoctane\\.com\\/\\S*job\\/`;
	const defaultMyName = '';
	const defaultHighlightNames = '';
	const defaultCommitUrlPrefix = `https://github.houston.softwaregrp.net/MQM/mqm/commit/`;
	const defaultGreenCommitMessagePattern = `^revert|oops!`;
	const defaultYellowCommitMessagePattern = `^feature|^story|^user story|^us[ #]`;
	const defaultRedCommitMessagePattern = `^defect|^bug`;
	const defaultBlueCommitMessagePattern = `^quality story|^qs[ #]`;
	const defaultPurpleCommitMessagePattern = ``;

	function loadValues(obj, cb) {
		chrome.storage.local.get(obj, vals => {
			cb(vals);
		});
	}

	function saveValues(obj) {
		for (let [k, v] of Object.entries(obj)) {
			chrome.storage.local.set({[k]: v}, () => {});
		}
	}

	async function onPopupLoad() {
		document.getElementById('jenkins-ext-popup-cancel-button').addEventListener('click', onPopupCancel);
		document.getElementById('jenkins-ext-popup-save-button').addEventListener('click', onPopupSave);

		loadValues({
			[storageUrlPatternKey]: defaultUrlPattern,
			[storageMyNameKey]: defaultMyName,
			[storageHighlightNamesKey]: defaultHighlightNames,
			[storageCommitUrlPrefixKey]: defaultCommitUrlPrefix,
			[storageGreenCommitMessagePatternKey]: defaultGreenCommitMessagePattern,
			[storageYellowCommitMessagePatternKey]: defaultYellowCommitMessagePattern,
			[storageRedCommitMessagePatternKey]: defaultRedCommitMessagePattern,
			[storageBlueCommitMessagePatternKey]: defaultBlueCommitMessagePattern,
			[storagePurpleCommitMessagePatternKey]: defaultPurpleCommitMessagePattern
		}, vals => {
			document.getElementById('url-pattern-input').value = vals[storageUrlPatternKey];
			document.getElementById('my-name-input').value = vals[storageMyNameKey];
			document.getElementById('highlight-names-input').value = vals[storageHighlightNamesKey];
			document.getElementById('commit-link-prefix-input').value = vals[storageCommitUrlPrefixKey];
			document.getElementById('green-commit-msg-pattern-input').value = vals[storageGreenCommitMessagePatternKey];
			document.getElementById('yellow-commit-msg-pattern-input').value = vals[storageYellowCommitMessagePatternKey];
			document.getElementById('red-commit-msg-pattern-input').value = vals[storageRedCommitMessagePatternKey];
			document.getElementById('blue-commit-msg-pattern-input').value = vals[storageBlueCommitMessagePatternKey];
			document.getElementById('purple-commit-msg-pattern-input').value = vals[storagePurpleCommitMessagePatternKey];
		});
	}

	function onPopupSave() {
		saveValues({
			[storageUrlPatternKey]: (document.getElementById('url-pattern-input').value || '').trim(),
			[storageMyNameKey]: (document.getElementById('my-name-input').value || '').trim(),
			[storageHighlightNamesKey]: (document.getElementById('highlight-names-input').value || '').trim(),
			[storageCommitUrlPrefixKey]: (document.getElementById('commit-link-prefix-input').value || '').trim(),
			[storageGreenCommitMessagePatternKey]: (document.getElementById('green-commit-msg-pattern-input').value || '').trim(),
			[storageYellowCommitMessagePatternKey]: (document.getElementById('yellow-commit-msg-pattern-input').value || '').trim(),
			[storageRedCommitMessagePatternKey]: (document.getElementById('red-commit-msg-pattern-input').value || '').trim(),
			[storageBlueCommitMessagePatternKey]: (document.getElementById('blue-commit-msg-pattern-input').value || '').trim(),
			[storagePurpleCommitMessagePatternKey]: (document.getElementById('purple-commit-msg-pattern-input').value || '').trim()
		});
		window.close();
	}

	function onPopupCancel() {
		window.close();
	}

	document.addEventListener('DOMContentLoaded', onPopupLoad, false);

})();
