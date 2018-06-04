(function() {

	let highlightedCommiters = [];
	let buildInfos = {};
	let buildNumberDomElms = document.querySelectorAll('.build-row-cell .pane.build-name .display-name');

	function getInfo(url, cb, prm) {
		let xhr = new XMLHttpRequest();
		xhr.onreadystatechange = function() {
			if (xhr.readyState === 4) {
				try {
					let json = JSON.parse(xhr.response);
					cb(json, prm);
				} catch(err) {
				}
			}
		};
		xhr.onerror = function() {
			alert('err');
		};
		xhr.open('GET', url, true);
	    xhr.send('');
	}

	function formatCommiterName(commitAuthor) {
		let commiterName = commitAuthor.replace(/[,]/g, '');
		commiterName = commiterName.replace(/[._]/g, ' ');
	    commiterName = commiterName.replace(/\w\S*/g, function(txt) {
	        return txt.charAt(0).toUpperCase() + txt.substr(1);
		});
		return commiterName.trim();
	}

	function getBuildLinkElement(buildNumber) {
		let result = null;
		if (buildNumberDomElms && buildNumberDomElms.length > 0) {
			let found = false;
			buildNumberDomElms.forEach(buildLinkElm => {
				if (!found && buildLinkElm.innerHTML === '#' + buildNumber) {
					found = true;
					result = buildLinkElm;
				}
			});
		}
		return result;
	}

	function displayBuildCommiters(buildNumber, commiterInfos) {
		let buildLinkElm = getBuildLinkElement(buildNumber);
		if (commiterInfos.length !== 0 && buildLinkElm) {
			let parentElm = buildLinkElm.parentElement.parentElement.parentElement;
			let commitersElm = document.createElement('div');
			commitersElm.className = 'jenkins-ext-build-commiters';
			commiterInfos.forEach(commmiterInfo => {
				let elm = document.createElement('a');
				elm.style['display'] = 'block';
				elm['href'] = 'mailto:' + commmiterInfo.email;
				elm.className = 'jenkins-ext-build-commiter' + (highlightedCommiters.indexOf(commmiterInfo.name.toLowerCase()) === -1 ? '' : ' jenkins-ext-build-commiter--highlight');
				elm.innerHTML = commmiterInfo.name;
				let tooltip = '';
				let count = 0;
				commmiterInfo.commits.forEach(c => {
					count++;
					if (count > 1) {
						tooltip += `---\n`;
					}
					tooltip += c.comment;
				});
				elm.setAttribute('title', tooltip);
				commitersElm.appendChild(elm);
			});
			parentElm.appendChild(commitersElm);
		}
	}

	function onGetBuildInfoDone(info, buildNumber) {
		let commiterNames = [];
		let commiterInfos = [];
		info.changeSet.items.forEach(commit => {
			let commiterName = formatCommiterName(commit.author.fullName);
			if (commiterNames.indexOf(commiterName) === -1) {
				commiterNames.push(commiterName);
				commiterInfos.push({
					name: commiterName,
					email: commit.authorEmail,
					commits: []
				});
			}
			commiterInfos[commiterNames.indexOf(commiterName)].commits.push({
				id: commit.id,
				fileCount: commit.paths.length,
				comment: commit.comment
			});
	});
		commiterInfos.sort((a, b) => {
			return a.name.localeCompare(b.name);
		});
		displayBuildCommiters(buildNumber, commiterInfos);
	}

	function onGetRootJobInfoDone(info) {
		if (info.builds) {
			info.builds.forEach(build => {
				buildInfos[build.number] = {
					number: build.number,
					url: build.url
				};
				getInfo(build.url + 'api/json', onGetBuildInfoDone, build.number);
			});
		}
	}

	chrome.runtime.onMessage.addListener(function (request /*, sender, sendResponse*/) {
		if (request.type === 'jenkins-chrome-ext-go') {
			highlightedCommiters = (request.highlightCommiters || '').toLowerCase().split(',').map(Function.prototype.call, String.prototype.trim);
			getInfo(document.location.href + 'api/json', onGetRootJobInfoDone, null);
		}
	});

})();
