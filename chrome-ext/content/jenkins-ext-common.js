//let extId = 'cjmholedpdghokadoionhngnmfpeebnk';
let buildStatusEnum = {
	PENDING: 'PENDING',
	RUNNING: 'RUNNING',
	SUCCESS: 'SUCCESS',
	WARNING: 'WARNING',
	FAILURE: 'FAILURE',
	ABORTED: 'ABORTED',
	UNKNOWN: 'UNKNOWN'
};
let buildResult = {
	SUCCESS:  'SUCCESS',
	FAILURE:  'FAILURE',
	UNSTABLE: 'UNSTABLE',
};
let buildInfos = {};
let fetchCache = {};

function hash(str) {
	let hash = 0, i, l;
	for (i = 0, l = str.length; i < l; i++) {
		hash = ((hash<<5)-hash) + str.charCodeAt(i) | 0;
	}
	return hash;
}

async function goFetchJson(url) {
	try {
		if (!fetchCache[url]) {
			const res = await fetch(url);
			if (!fetchCache[url]) {
				fetchCache[url] = await res.json();
			}
		}
	} catch {
		fetchCache[url] = null;
	}
	return fetchCache[url] || null;
}

function getBuildLinkElement(buildNumber) {
	let result = null;
	const buildNumberDomElms = document.querySelectorAll('.build-row-cell .pane.build-name .display-name');
	if (buildNumberDomElms && buildNumberDomElms.length > 0) {
		let found = false;
		buildNumberDomElms.forEach(buildLinkElm => {
			if (!found && buildLinkElm.innerText.replace(/[^\x00-\x7F]/g, '').trim() === '#' + buildNumber) {
				found = true;
				result = buildLinkElm;
			}
		});
	}
	return result;
}

function getBuildStatus(buildNumber) {
	let buildStatus = buildStatusEnum.UNKNOWN;
	let buildLinkElm = getBuildLinkElement(buildNumber);
	if (buildLinkElm) {
		let parentElm = buildLinkElm.parentElement.parentElement.parentElement;
		let statusImg = parentElm.querySelector('.build-status-link > img.icon-sm');
		if (statusImg) {
			if (statusImg.classList.contains('icon-blue')) {
				buildStatus = buildStatusEnum.SUCCESS;
			} else if (statusImg.classList.contains('icon-yellow')) {
				buildStatus = buildStatusEnum.WARNING;
			} else if (statusImg.classList.contains('icon-red')) {
				buildStatus = buildStatusEnum.FAILURE;
			} else if (statusImg.classList.contains('icon-aborted')) {
				buildStatus = buildStatusEnum.ABORTED;
			} else if (statusImg.classList.contains('icon-grey')) {
				buildStatus = buildStatusEnum.PENDING;
			} else if (statusImg.className.indexOf('-anim') !== -1) {
				buildStatus = buildStatusEnum.RUNNING;
			}
		}
	}
	return buildStatus;
}

function addBuildPanelClass(buildNumber) {
	let buildLinkElm = getBuildLinkElement(buildNumber);
	if (buildLinkElm) {
		let parentElm = buildLinkElm.parentElement.parentElement.parentElement;
		let buildStatus = buildInfos[buildNumber].status;
		parentElm.classList.add(`jenkins-ext-build-status--${buildStatus.toLowerCase()}`);
	}
}
