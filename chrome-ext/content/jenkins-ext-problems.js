const ON_PROBLEM_MAX_NUM_OF_BUILDS_TO_INSPECT = 10;
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

	let problemLinkElm = document.createElement('a');
	problemLinkElm.setAttribute('href', `/${problem.url}consoleFull`);
	problemLinkElm.setAttribute('target', '_blank');
	problemLinkElm.setAttribute('title', 'View console log');

	let consoleImgElm = document.createElement('img');
	consoleImgElm.setAttribute('src', chrome.extension.getURL('img/terminal.png'));
	consoleImgElm.className = 'jenkins-ext-build-problem-console-img';
	problemLinkElm.appendChild(consoleImgElm);

	problemLineElm.appendChild(problemLinkElm);

	let problemTextElm = document.createElement('div');
	problemTextElm.innerText = problem.jobName;
	problemTextElm.className = 'jenkins-ext-build-problem-text';
	problemLineElm.appendChild(problemTextElm);

	parentElm.appendChild(problemLineElm);
}

async function getProblemLastSuccess(problem) {
	let lastSuccess = null;
	let goOn = true;
	let i = 1;
	do {
		const n = problem.buildNumber - i;
		const bUrl = problem.url.replace(`/${problem.buildNumber}/`, `/${n}/`);
		const json = await goFetchJson(`/${bUrl}api/json`);
		if (!json) {
			goOn = false;
		} else if (json.result === buildResult.SUCCESS) {
			lastSuccess = json;
			goOn = false;
		} else {
			i++;
		}
	} while (goOn && i <= ON_PROBLEM_MAX_NUM_OF_BUILDS_TO_INSPECT);
	return lastSuccess;
}

async function getMeaningfulLines(...textUrls) {
	const result = [];
	const promises = [];
	textUrls.forEach(u => {
		promises.push(goFetchText(u),);
	});
	const textResults = await Promise.all(promises);
	for (let i = 0; i < textUrls.length; i++) {
		if (!linesCache[textUrls[i]]) {
			linesCache[textUrls[i]] = textResults[i].split('\n')
			.map(l => l.replace(/^\[(?:ERROR|WARNING|INFO|DEBUG)]\s-*$/, '').trim())
			.filter(l => l.length > 0);
		}
		result.push(linesCache[textUrls[i]]);
	}
	return result;
}

async function investigateProblem(problem) {
	if (!problem.url || !problem.jobName) {
		return;
	}
	problem.lastSuccess = await getProblemLastSuccess(problem);
	if (problem.lastSuccess) {
		const problemTextUrl = `/${problem.url}consoleText`;
		const successTextUrl = `/${problem.url.replace(`/${problem.buildNumber}/`, `/${problem.lastSuccess.number}/`)}consoleText`;
		const [problemLinesText, successLinesText] = await getMeaningfulLines(problemTextUrl, successTextUrl);
		const problemLinesHash = [];
		const successLinesHash = [];
		problemLinesText.forEach(l => {
			problemLinesHash.push(hash(l));
		});
		successLinesText.forEach(l => {
			successLinesHash.push(hash(l));
		});
		console.log(`${problem.jobName} P:${problem.buildNumber}.${problemLinesHash.length} S:${problem.lastSuccess.number}.${successLinesHash.length}`);
	} else {
		//const problemLines = await getMeaningfulLines(problemTextUrl);
		//console.log(`${problem.jobName} P:${problem.buildNumber} S:NA`);
	}
}

async function investigateAllProblems() {
	const buildNumbers = Object.keys(buildInfos)
	.filter(k => buildInfos[k].problems && buildInfos[k].problems.length > 0);
	const promises = [];
	for (let i = buildNumbers.length - 1; i >= 0; i--) {
		for (let j = 0; j < buildInfos[buildNumbers[i]].problems.length; j++) {
			promises.push(investigateProblem(buildInfos[buildNumbers[i]].problems[j]));
		}
	}
	await Promise.all(promises);
}
