const ON_PROBLEM_MAX_NUM_OF_BUILDS_TO_INSPECT = 20;
let linesCache = {};

async function goFetchText(url) {
	try {
		if (!fetchCache[url]) {
			const res = await fetch(url);
			if (!fetchCache[url]) {
				let textResult = await res.text();
				if (!fetchCache[url]) {
					fetchCache[url] = /^<html>/.test(textResult) ? '' : textResult;
				}
			}
		}
	} catch {
		fetchCache[url] = '';
	}
	return fetchCache[url] || '';
}

function addProblems(problems, buildNumber, rec) {
	if (rec.result && rec.result !== buildResult.FAILURE && rec.result !== buildResult.UNSTABLE) {
		//do nothing
	} else if (rec.build && rec.build.subBuilds && rec.build.subBuilds.length > 0) {
		addProblems(problems, buildNumber, rec.build);
	} else if (rec.subBuilds && rec.subBuilds.length > 0) {
		let problem = null;
		rec.subBuilds.forEach(sb => {
			if (!problem) {
				problem = addProblems(problems, buildNumber, sb);
			}
		});
		return problem;
	} else {
		problems.push(rec);
	}
}

function addClickHandler(elm, cb, ...params) {
	elm.addEventListener('click', async () => {
		cb(params).then();
	}, false);
}

function displayBuildProblem(buildNumber, problem) {
	let buildLinkElm = getBuildLinkElement(buildNumber);
	if (!buildLinkElm) {
		return;
	}
	let parentElm = buildLinkElm.parentElement.parentElement.parentElement;
	let problemLineElm = document.createElement('div');
	let statusStyle = '';
	if (problem.result === buildResult.FAILURE) {
		statusStyle = 'jenkins-ext-build-problem-line--failure';
	} else if (problem.result === buildResult.UNSTABLE) {
		statusStyle = 'jenkins-ext-build-problem-line--unstable';
	}
	problemLineElm.className = `jenkins-ext-build-problem-line ${statusStyle}`;

	// let problemLinkElm = document.createElement('a');
	// problemLinkElm.setAttribute('href', `/${problem.url}consoleFull`);
	// problemLinkElm.setAttribute('target', '_blank');
	// problemLinkElm.setAttribute('title', 'View full console output');
	// let consoleImgElm = document.createElement('img');
	// consoleImgElm.setAttribute('id', `jenkins-ext-build-problem-terminal-img-${buildNumber}-${problem.jobName.toLowerCase()}`);
	// consoleImgElm.setAttribute('src', chrome.extension.getURL('img/terminal.png'));
	// consoleImgElm.className = 'jenkins-ext-build-problem-console-img';
	// problemLinkElm.appendChild(consoleImgElm);
	// problemLineElm.appendChild(problemLinkElm);

	if (problem.url && problem.jobName) {
		let consoleErrImgElm = document.createElement('img');
		//consoleErrImgElm.setAttribute('id', `jenkins-ext-build-problem-terminal-err-img-${buildNumber}-${problem.jobName.toLowerCase()}`);
		consoleErrImgElm.setAttribute('data-url-console-full', `/${problem.url}consoleFull`);
		consoleErrImgElm.setAttribute('data-build-number', buildNumber);
		consoleErrImgElm.setAttribute('data-job-name', problem.jobName);
		consoleErrImgElm.setAttribute('src', chrome.extension.getURL('img/terminal-err.png'));
		consoleErrImgElm.className = 'jenkins-ext-build-problem-console-err-img';
		addClickHandler(consoleErrImgElm, investigateBuildProblem, problem);
		problemLineElm.appendChild(consoleErrImgElm);
	}

	let problemTextElm = document.createElement('div');
	problemTextElm.innerText = problem.jobName;
	problemTextElm.className = 'jenkins-ext-build-problem-text';
	problemLineElm.appendChild(problemTextElm);

	parentElm.appendChild(problemLineElm);
}

async function getProblemLastSuccesses(problem) {
	let lastSuccesses = [];
	const promises = [];
	for (let i = 1; i <= ON_PROBLEM_MAX_NUM_OF_BUILDS_TO_INSPECT; i++) {
		const bUrl = problem.url.replace(`/${problem.buildNumber}/`, `/${problem.buildNumber - i}/`);
		promises.push(goFetchJson(`/${bUrl}api/json`));
	}
	const results = await Promise.all(promises);
	results.forEach(json => {
		if (json && json.result === buildResult.SUCCESS) {
			lastSuccesses.push(json);
		}
	});
	return lastSuccesses;
}

async function getMeaningfulLines(textUrl) {
	const textResult = await goFetchText(textUrl);
	if (!linesCache[textUrl]) {
		linesCache[textUrl] = textResult.split('\n').filter(l => l.length>0 && !/^\[?(INFO|WARN|WARNING)[\] ]/.test(l));
	}
	return linesCache[textUrl];
}

function getLinesHash(line) {
	return hash(line
		.replace(/[-_,;:.'"|~!@#$%^&*()=+?<>/\\[\]]{}/g,' ')
		.replace(/\d\s|\d+\S+\d*\S*|\S+\d+\d*\S*/g,'D'));
}

async function investigateBuildProblem(params) {
	const [problem] = params;
	problem.lastSuccesses = await getProblemLastSuccesses(problem);
	if (problem.lastSuccesses.length === 0) {
		window.open(`/${problem.url}consoleFull`);
	} else {
		const problemTextUrl = `/${problem.url}consoleText`;
		const problemLinesText = await getMeaningfulLines(problemTextUrl);
		const problemLinesHash = [];
		problemLinesText.forEach(l => {
			problemLinesHash.push(getLinesHash(l));
		});
		const successLinesHashSet = new Set();
		for (let i = 0; i < problem.lastSuccesses.length; i++) {
			const successTextUrl = `/${problem.url.replace(`/${problem.buildNumber}/`, `/${problem.lastSuccesses[i].number}/`)}consoleText`;
			const successLinesText = await getMeaningfulLines(successTextUrl);
			successLinesText.forEach(l => {
				successLinesHashSet.add(getLinesHash(l));
			});
		}
		console.log(`########## ${problem.jobName} F:${problem.buildNumber}`);
		problemLinesHash.forEach((l, i) => {
			if (!successLinesHashSet.has(l)) {
				console.log(`[${i}] ${problemLinesText[i]}`);
			}
		});
	}
}

// async function investigateAllProblems() {
// 	const buildNumbers = Object.keys(buildInfos)
// 	.filter(k => buildInfos[k].problems && buildInfos[k].problems.length > 0);
// 	const promises = [];
// 	buildNumbers.forEach((bn) => {
// 		buildInfos[bn].problems.forEach(p => {
// 			promises.push(investigateProblem(bn, p));
// 		});
// 	});
// 	await Promise.all(promises);
// }
