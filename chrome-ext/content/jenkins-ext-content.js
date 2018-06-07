(function() {

	let buildStatusEnum = {
		NA: 'NA',
		OK: 'OK',
		WARN: 'WARN',
		ERROR: 'ERROR',
		ABORT: 'ABORT',
		RUN: 'RUN'
	};
	let buildInfos = {};
	let highlightedCommiters = [];
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

	function displayBuildCommiters(buildNumber) {
		let bi = buildInfos[buildNumber];
		let buildLinkElm = getBuildLinkElement(buildNumber);
		if (bi.commiterInfos.length !== 0 && buildLinkElm) {
			let parentElm = buildLinkElm.parentElement.parentElement.parentElement;
			let commitersElm = document.createElement('div');
			commitersElm.className = 'jenkins-ext-build-commiters';
			bi.commiterInfos.forEach(ci => {
				let elm = document.createElement('a');
				elm.style['display'] = 'block';
				elm['href'] = 'mailto:' + ci.email;
				elm.className = 'jenkins-ext-build-commiter' + (highlightedCommiters.indexOf(ci.name.toLowerCase()) === -1 ? '' : ' jenkins-ext-build-commiter--highlight');
				elm.innerHTML = ci.name;
				let tooltip = '';
				let count = 0;
				ci.commits.forEach(c => {
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

	function getBuildStatus(buildNumber) {
		let buildStatus = buildStatusEnum.NA;
		let buildLinkElm = getBuildLinkElement(buildNumber);
		if (buildLinkElm) {
			let parentElm = buildLinkElm.parentElement.parentElement.parentElement;
			let statusImg = parentElm.querySelector('.build-status-link > img.icon-sm');
			if (statusImg) {
				if (statusImg.classList.contains('icon-blue')) {
					buildStatus = buildStatusEnum.OK;
				} else if (statusImg.classList.contains('icon-yellow')) {
					buildStatus = buildStatusEnum.WARN;
				} else if (statusImg.classList.contains('icon-red')) {
					buildStatus = buildStatusEnum.ERROR;
				} else if (statusImg.classList.contains('icon-aborted')) {
					buildStatus = buildStatusEnum.ABORT;
				} else if (statusImg.className.indexOf('-anim') !== -1) {
					buildStatus = buildStatusEnum.RUN;
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
			if (buildStatus === buildStatusEnum.OK) {
				parentElm.classList.add('jenkins-ext-build-status--ok');
			} else if (buildStatus === buildStatusEnum.WARN) {
				parentElm.classList.add('jenkins-ext-build-status--warn');
			} else if (buildStatus === buildStatusEnum.ERROR) {
				parentElm.classList.add('jenkins-ext-build-status--error');
			} else if (buildStatus === buildStatusEnum.ABORT) {
				parentElm.classList.add('jenkins-ext-build-status--abort');
			} else if (buildStatus === buildStatusEnum.RUN) {
				parentElm.classList.add('jenkins-ext-build-status--run');
			} else if (buildStatus === buildStatusEnum.NA) {
				parentElm.classList.add('jenkins-ext-build-status--na');
			}
		}
	}

	function onGetBuildInfoDone(json, buildNumber) {
		let bi = buildInfos[buildNumber];
		bi.status = getBuildStatus(buildNumber);
		bi.commiterInfos = [];
		addBuildPanelClass(buildNumber);
		let names = [];
		json.changeSet.items.forEach(commit => {
			let commiterName = formatCommiterName(commit.author.fullName);
			if (names.indexOf(commiterName) === -1) {
				names.push(commiterName);
				bi.commiterInfos.push({
					name: commiterName,
					email: commit.authorEmail,
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
		displayBuildCommiters(buildNumber);
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

	// function observeDOM(obj, callback){
	// 	let MutationObserver = window.MutationObserver || window.WebKitMutationObserver;
	// 	let obs = new MutationObserver(function(mutations, observer){
	// 		if( mutations[0].addedNodes.length || mutations[0].removedNodes.length )
	// 			callback();
	// 	});
	// 	obs.observe( obj, { childList:true, subtree:true });
	// }

	chrome.runtime.onMessage.addListener(function (request /*, sender, sendResponse*/) {
		if (request.type === 'jenkins-chrome-ext-go') {
			highlightedCommiters = (request.highlightCommiters || '').toLowerCase().split(',').map(Function.prototype.call, String.prototype.trim);
			getInfo(document.location.href + 'api/json', onGetRootJobInfoDone, null);
			// setTimeout(() => {
			// 		observeDOM(document.getElementById('buildHistory'), () => {
			// 			console.log('build history was changed');
			// 		});
			// }, 3000);
		}
	});

})();
