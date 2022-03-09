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
