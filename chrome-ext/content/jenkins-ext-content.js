function getBuildStatusSvgContent(status) {
    if (status === 'success') {
        return `<ellipse cx="256" cy="256" fill="none" rx="210" ry="210" stroke="var(--success-color)" stroke-linecap="round" stroke-miterlimit="10" stroke-width="36"></ellipse>    <path d="M336 189L224 323L176 269.4" fill="transparent" stroke="var(--success-color)" stroke-linecap="round" stroke-linejoin="round" stroke-width="36"></path>`;
    }
    if (status === 'unstable') {
        return `<ellipse cx="256" cy="256" fill="none" rx="210" ry="210" stroke="var(--orange)" stroke-linecap="round" stroke-miterlimit="10" stroke-width="36"></ellipse>    <path d="M250.26 166.05L256 288l5.73-121.95a5.74 5.74 0 00-5.79-6h0a5.74 5.74 0 00-5.68 6z" fill="none" stroke="var(--orange)" stroke-linecap="round" stroke-linejoin="round" stroke-width="36"></path>    <ellipse cx="256" cy="350" fill="var(--orange)" rx="26" ry="26"></ellipse>`;
    }
    if (status === 'failure') {
        return `<ellipse cx="256" cy="256" fill="none" rx="210" ry="210" stroke="var(--red)" stroke-linecap="round" stroke-miterlimit="10" stroke-width="36"></ellipse>    <path d="M320 320L192 192M192 320l128-128" fill="none" stroke="var(--red)" stroke-linecap="round" stroke-linejoin="round" stroke-width="36"></path>`;
    }
    if (status === 'aborted') {
        return `<ellipse cx="256" cy="256" fill="none" rx="210" ry="210" stroke="var(--text-color-secondary)" stroke-linecap="round" stroke-miterlimit="10" stroke-width="36"></ellipse>    <path d="M192 320l128-128" fill="none" stroke="var(--text-color-secondary)" stroke-linecap="round" stroke-linejoin="round" stroke-width="36"></path>`;
    }
    if (status === 'not_built') {
        return `<ellipse cx="256" cy="256" fill="none" rx="210" ry="210" stroke="var(--blue)" stroke-linecap="round" stroke-miterlimit="10" stroke-width="36"></ellipse>  <circle cx="256" cy="256" fill="var(--blue)" r="30"></circle>  <circle cx="352" cy="256" fill="var(--blue)" r="30"></circle>  <circle cx="160" cy="256" fill="var(--blue)" r="30"></circle>`;
    }
    if (status === 'unknown') {
        return `<ellipse cx="256" cy="256" fill="none" rx="210" ry="210" stroke="var(--blue)" stroke-linecap="round" stroke-miterlimit="10" stroke-width="36"></ellipse>  <circle cx="256" cy="256" fill="var(--blue)" r="30"></circle>  <circle cx="352" cy="256" fill="var(--blue)" r="30"></circle>  <circle cx="160" cy="256" fill="var(--blue)" r="30"></circle>`;
    }
    return '';
}

function onGetBuildInfoDone(json, buildNumber) {
	let bi = buildInfos[buildNumber];
    bi.result = json.result;
    console.log(bi.result);
    const buildStatus = bi.result ? bi.result.toLowerCase() : 'unknown';
    const buildStatusElm = getElm(`.jenkins-ext-build-section[data-build-number="${buildNumber}"] .jenkins-ext-build-status-icon`);
    buildStatusElm.setAttribute('data-build-status', buildStatus);
    buildStatusElm.innerHTML = getBuildStatusSvgContent(buildStatus);
    const timestampElm = getElm(`.jenkins-ext-build-section[data-build-number="${buildNumber}"] .jenkins-ext-build-timestamp`);
    timestampElm.innerText = timestampToLocalString(json.timestamp);
	bi.commiterInfos = [];
	let names = [];

    const commits = [];
    if (json.changeSet?.items) {
        commits.push(...json.changeSet.items);
    } else if (json.changeSets) {
        json.changeSets.forEach(cs => {
            if (cs.items) {
                commits.push(...cs.items);
            }
        });
    }
    commits.forEach(commit => {
		if (commit.author.fullName === 'noreply') {
			bi.commiterInfos.push({
				name: '???',
				email: '',
				commits: [{
					id: commit.id,
					fileCount: commit.paths.length,
					comment: commit.comment
				}],
			});
		} else {
            console.log('########## ' + commit.remoteUrls);
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
			const infos = bi.commiterInfos.find(info => info.name === commiterName);
			infos.commits.push({
				id: commit.id,
				fileCount: commit.paths.length,
				comment: commit.comment
			});
		}
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

function timestampToLocalString(timestamp) {
    const date = new Date(timestamp);
    const weekday = date.toLocaleString(undefined, { weekday: 'long' });
    const month = date.toLocaleString(undefined, { month: 'long' });
    const day = date.getDate();
    const time = date.toLocaleString(undefined, {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
    });
    return `${time}, ${weekday}, ${month} ${day}`;
}

function addBuildSectionElm(build) {
    const extPanelElm = getElm('.jenkins-ext-panel');
    const buildSectionElm = document.createElement('div');
    buildSectionElm.classList.add('jenkins-ext-build-section');
    buildSectionElm.setAttribute('data-build-number', build.number);

    const buildHeaderElm = document.createElement('div');
    buildHeaderElm.classList.add('jenkins-ext-build-header');
    buildSectionElm.appendChild(buildHeaderElm);

    const buildStatusElm = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    buildStatusElm.setAttribute('viewBox', '0 0 512 512');
    buildStatusElm.setAttribute('width', '16px');
    buildStatusElm.setAttribute('height', '16px');
    buildStatusElm.classList.add('jenkins-ext-build-status-icon');
    buildHeaderElm.appendChild(buildStatusElm);

    const buildLinkElm = document.createElement('a');
    buildLinkElm.href = build.url;
    buildLinkElm.classList.add('jenkins-ext-build-link');
    buildLinkElm.innerText = build.number;
    buildHeaderElm.appendChild(buildLinkElm);

    const timestampElm = document.createElement('div');
    timestampElm.classList.add('jenkins-ext-build-timestamp');
    buildHeaderElm.appendChild(timestampElm);

    const buildContentElm = document.createElement('div');
    buildContentElm.classList.add('jenkins-ext-build-section-content');
    buildSectionElm.appendChild(buildContentElm);
    extPanelElm.appendChild(buildSectionElm);
}

async function onGetRootJobInfoDone(info) {
    if (!info || !info.builds) {
        return;
    }
    info.builds.forEach(build => {
        buildInfos[build.number] = {
            number: build.number,
            url: build.url,
        };
        addBuildSectionElm(build);
    });
    const promises = [];
    info.builds.forEach(build => {
        promises.push(handleBuildInfo(build));
    });
    await Promise.all(promises);
}

function addMyUI() {
    const jenkinsBuildsElm = getElm('#jenkins-builds');
    const jenkinsCardTitleElm = getElm('.jenkins-card__title');
    const jenkinsCardContentElm = getElm('.jenkins-card__content');
    if (!jenkinsBuildsElm || !jenkinsCardTitleElm || !jenkinsCardContentElm) {
        return
    }
    const toggleBun = document.createElement('button');
    toggleBun.classList.add('jenkins-ext-display-panel-toggle-btn');
    toggleBun.innerText = 'Commits';
    jenkinsCardTitleElm.appendChild(toggleBun);
    toggleBun.addEventListener('click', () => {
        jenkinsBuildsElm.classList.toggle('jenkins-ext-show-panel');
    });
    const extPanelElm = document.createElement('div');
    extPanelElm.classList.add('jenkins-ext-panel');
    jenkinsBuildsElm.appendChild(extPanelElm);
}

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
		cleanupZwsInsertedElements();
        addMyUI();
		(async () => {
			const json = await goFetchJson(baseLocation + 'api/json');
			await onGetRootJobInfoDone(json);
		})();

		return true;
	}
});
