//let extId = 'cjmholedpdghokadoionhngnmfpeebnk';
let storageUrlPatternKey = 'jenkins-ext-url-pattern';
let storageMyNameKey = 'jenkins-ext-my-name';
let storageHighlightNamesKey = 'jenkins-ext-highlight-names';
let storageCommitUrlPrefixKey = 'jenkins-ext-commit-url-prefix';
let storageGreenCommitMessagePatternKey = 'jenkins-ext-green-commit-message-pattern';
let storageYellowCommitMessagePatternKey = 'jenkins-ext-yellow-commit-message-pattern';
let storageRedCommitMessagePatternKey = 'jenkins-ext-red-commit-message-pattern';
let storageBlueCommitMessagePatternKey = 'jenkins-ext-blue-commit-message-pattern';
let storagePurpleCommitMessagePatternKey = 'jenkins-ext-purple-commit-message-pattern';

let defaultUrlPattern = `https?:\\/\\/jenkins\\.almoctane\\.com\\/\\S*job\\/`;
let defaultMyName = '';
let defaultHighlightNames = '';
let defaultCommitUrlPrefix = `https://github.houston.softwaregrp.net/MQM/mqm/commit/`;
let defaultGreenCommitMessagePattern = `^revert|oops!`;
let defaultYellowCommitMessagePattern = `^feature|^story|^user story|^us[ #]`;
let defaultRedCommitMessagePattern = `^defect|^bug`;
let defaultBlueCommitMessagePattern = `^quality story|^qs[ #]`;
let defaultPurpleCommitMessagePattern = ``;

function loadValue(storageKey, defaultValue) {
	return localStorage.getItem(storageKey) !== null ? localStorage.getItem(storageKey) : defaultValue;
}
