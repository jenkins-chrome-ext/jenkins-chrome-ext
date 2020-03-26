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
		linesCache[textUrl] = textResult.split('\n').filter(l =>
			l.length > 0
			&& /[a-zA-Z0-9]+/.test(l)
			&& !/^\[?(INFO|WARN|WARNING)[\] ]/.test(l)
			);
	}
	return linesCache[textUrl];
}

function getLinesHash(line) {
	return hash(line
		.replace(/[-_,;:.'"|~!@#$%^&*()=+?<>/\\[\]]{}/g,' ')
		.replace(/\d\s|\d+\S+\d*\S*|\S+\d+\d*\S*/g,'D'));
}

function showProblemDialogBackdrop() {
	let problemDialogBackdropElm = document.getElementById('jenkins-ext-build-problem-dialog-backdrop');
	if (problemDialogBackdropElm) {
		problemDialogBackdropElm.classList.remove('jenkins-ext-hidden');
	} else {
		problemDialogBackdropElm = document.createElement('div');
		problemDialogBackdropElm.setAttribute('id', 'jenkins-ext-build-problem-dialog-backdrop');
		problemDialogBackdropElm.className = 'jenkins-ext-build-problem-dialog-backdrop';
		document.body.appendChild(problemDialogBackdropElm);
	}
}

function hideProblemDialogBackdrop() {
	const problemDialogBackdropElm = document.getElementById('jenkins-ext-build-problem-dialog-backdrop');
	if (problemDialogBackdropElm) {
		problemDialogBackdropElm.classList.add('jenkins-ext-hidden');
	}
}

function showProblemDialog(problem) {
	let problemDialogElm = document.getElementById('jenkins-ext-build-problem-dialog');
	if (problemDialogElm) {
		problemDialogElm.innerHTML = '';
	} else {
		problemDialogElm = document.createElement('div');
		problemDialogElm.setAttribute('id', 'jenkins-ext-build-problem-dialog');
		problemDialogElm.className = 'jenkins-ext-build-problem-dialog';
	}

	let consoleLinkElm = document.createElement('a');
	consoleLinkElm.setAttribute('href', `/${problem.url}consoleFull`);
	consoleLinkElm.setAttribute('target', '_blank');
	consoleLinkElm.innerText = 'Open full console output';
	consoleLinkElm.className = 'jenkins-ext-build-problem-dialog-console-link';
	problemDialogElm.appendChild(consoleLinkElm);

	let closeElm = document.createElement('button');
	closeElm.className = 'jenkins-ext-build-problem-dialog-close-btn';
	closeElm.innerText = 'x';
	closeElm.addEventListener('click', () => {
		problemDialogElm.classList.add('jenkins-ext-hidden');
		hideProblemDialogBackdrop();
	});
	problemDialogElm.appendChild(closeElm);

	let problemLinesElm = document.createElement('div');
	problemLinesElm.className = 'jenkins-ext-build-problem-dialog-lines';
	problemDialogElm.appendChild(problemLinesElm);
	document.body.appendChild(problemDialogElm);
	problemDialogElm.classList.remove('jenkins-ext-hidden');
	return problemLinesElm;
}

function populateProblemDialog(problemLinesElm, problem, uniqueProblemLines) {
	uniqueProblemLines.forEach(lineText => {
		let lineElm = document.createElement('div');
		lineElm.innerText = lineText;
		if (/fata|error|failure|failed|exception|unstable/ig.test(lineText)) {
			lineElm.className = 'jenkins-ext-build-problem-dialog-line jenkins-ext-build-problem-dialog-line--err';
		} else {
			lineElm.className = 'jenkins-ext-build-problem-dialog-line';
		}
		problemLinesElm.appendChild(lineElm);
	});
	problemLinesElm.style['cursor'] = 'text';
}

async function investigateBuildProblem(params) {
	showProblemDialogBackdrop();
	document.body.style.cursor = 'wait';
	try {
		const [problem] = params;
		problem.lastSuccesses = await getProblemLastSuccesses(problem);
		if (problem.lastSuccesses.length === 0) {
			hideProblemDialogBackdrop();
			window.open(`/${problem.url}consoleFull`);
		} else {
			const problemLinesElm = showProblemDialog(problem);
			const problemTextUrl = `/${problem.url}consoleText`;
			const problemLinesText = await getMeaningfulLines(problemTextUrl);
			const problemLinesHash = [];
			problemLinesText.forEach(l => {
				problemLinesHash.push(getLinesHash(l));
			});
			const successLinesHashSet = new Set();
			const promises = [];
			for (let i = 0; i < problem.lastSuccesses.length; i++) {
				const successTextUrl = `/${problem.url.replace(`/${problem.buildNumber}/`, `/${problem.lastSuccesses[i].number}/`)}consoleText`;
				promises.push(getMeaningfulLines(successTextUrl));
			}
			const successLinesTexts = await Promise.all(promises);
			successLinesTexts.forEach(successLinesText => {
				successLinesText.forEach(l => {
					successLinesHashSet.add(getLinesHash(l));
				});
			});
			const uniqueProblemLines = [];
			problemLinesHash.forEach((l, i) => {
				if (!successLinesHashSet.has(l)) {
					uniqueProblemLines.push(`${problemLinesText[i]}`);
				}
			});
			populateProblemDialog(problemLinesElm, problem, uniqueProblemLines);
		}
	} finally {
		document.body.style.cursor = 'auto';
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
