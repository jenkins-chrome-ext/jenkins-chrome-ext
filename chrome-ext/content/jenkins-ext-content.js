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
		bi.problems.sort(function (a, b) {
			return a.jobName.localeCompare(b.jobName);
		});
		bi.problems.forEach((p) => {
			if (p.url && p.jobName) {
				displayBuildProblem(buildNumber, p);
			}
		});
	}
	displayBuildCommiters(buildNumber);
}

async function handleBuildInfo(build) {
	const json = await goFetchJson(build.url + 'api/json');
	onGetBuildInfoDone(json, build.number);
}

async function onGetRootJobInfoDone(info) {
	if (!info || !info.builds) {
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

chrome.runtime.onMessage.addListener(request => {
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
