let buildStatusEnum = {
	PENDING: 'PENDING',
	RUNNING: 'RUNNING',
	SUCCESS: 'SUCCESS',
	WARNING: 'WARNING',
	FAILURE: 'FAILURE',
	ABORTED: 'ABORTED',
	UNKNOWN: 'UNKNOWN'
};

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

function onGetBuildInfoDone(json, buildNumber) {
	let bi = buildInfos[buildNumber];
	bi.commiterInfos = [];
	addBuildPanelClass(buildNumber);
	let names = [];
	json.changeSet.items.forEach(commit => {
		let commiterName = formatCommiterName(commit.author.fullName);
		if (names.indexOf(commiterName) === -1) {
			names.push(commiterName);
			let email = commit.authorEmail;

			//todo: should be generalized
			if (email.indexOf('@') === -1) {
				email += '@hpe.com';
			}
			email = email.replace('@hpe.com', '@microfocus.com');

			bi.commiterInfos.push({
				name: commiterName,
				email: email,
				commits: []
			});
		}
		bi.commiterInfos[names.indexOf(commiterName)].commits.push({
			id: commit.id,
			fileCount: commit.paths.length,
			comment: commit.comment
		});
	});
	bi.commiterInfos.sort((a, b) => {
		return a.name.localeCompare(b.name);
	});
	if (json.result === buildResult.FAILURE || json.result === buildResult.UNSTABLE) {
		bi.problems = [];
		addProblems(bi.problems, buildNumber, json);
		for (let i = 0; i < bi.problems.length; i++) {
			const p = bi.problems[i];
			if (p.url && p.jobName) {
				displayBuildProblem(buildNumber, p);
			}
		}
	}
	displayBuildCommiters(buildNumber);
}

async function handleBuildInfo(build) {
	const json = await goFetchJson(build.url + 'api/json');
	onGetBuildInfoDone(json, build.number);
}

async function onGetRootJobInfoDone(info) {
	if (!info.builds) {
		return;
	}
	info.builds.forEach(build => {
		buildInfos[build.number] = {
			number: build.number,
			url: build.url,
			status: getBuildStatus(build.number)
		};
	});
	const promises = [];
	info.builds.forEach(build => {
		promises.push(handleBuildInfo(build));
	});
	await Promise.all(promises);
	await investigateAllProblems();
}

// function updateRunningBuilds() {
// 	for (let n in buildInfos) {
// 		if (buildInfos[n].status === buildStatusEnum.RUNNING) {
// 			displayBuildCommiters(buildInfos[n].number);
// 		}
// 	}
// }

// function observeDOM(obj, callback){
// 	let obs = new MutationObserver((mutations) => {
// 		if( mutations[0].addedNodes.length || mutations[0].removedNodes.length )
//  	        callback();
//  	    });
// 	obs.observe( obj, { childList:true, subtree:true });
// }

chrome.runtime.onMessage.addListener(function (request /*, sender, sendResponse*/) {
	if (request.type === 'jenkins-chrome-ext-go') {
		myName = (request.myName || '').toLowerCase().trim();
		highlightedNames = (request.highlightNames || '').toLowerCase().split(',').map(Function.prototype.call, String.prototype.trim);
		commitUrlPrefix = (request.commitUrlPrefix || '').toLowerCase().trim();
		greenCommitMessagePattern = (request.greenCommitMessagePattern || '').trim();
		yellowCommitMessagePattern = (request.yellowCommitMessagePattern || '').trim();
		redCommitMessagePattern = (request.redCommitMessagePattern || '').trim();
		blueCommitMessagePattern = (request.blueCommitMessagePattern || '').trim();
		purpleCommitMessagePattern = (request.purpleCommitMessagePattern || '').trim();
		const baseLocation = document.location.href.replace(/\?\S*/, '');
		fetchCache = {};
		linesCache = {};
		(async () => {
			const json = await goFetchJson(baseLocation + 'api/json');
			await onGetRootJobInfoDone(json);
		})();

		// setTimeout(() => {
		// 	observeDOM(document.getElementById('buildHistory'), () => {
		// 		// console.log('build history was changed');
		// 		updateRunningBuilds();
		// 	});
		// }, 5000);
	}
});
