(function() {

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
	let buildInfos = {};
	let highlightedCommiters = [];
	let commitLinkPrefix = '';
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

	// function fixBuildNames() {
	// 	buildNumberDomElms.forEach(buildLinkElm => {
	// 		console.log(buildLinkElm.innerHTML);
	// 		buildLinkElm.innerHTML = buildLinkElm.innerHTML.replace(/[\u200B]/g, '').trim();
	// 	});
	// }

	function getBuildLinkElement(buildNumber) {
		let result = null;
		if (buildNumberDomElms && buildNumberDomElms.length > 0) {
			let found = false;
			buildNumberDomElms.forEach(buildLinkElm => {
				//if (!found && buildLinkElm.innerText.replace(/[\u200B]/g, '').trim() === '#' + buildNumber) {
				if (!found && buildLinkElm.innerText.trim() === '#' + buildNumber) {
					found = true;
					result = buildLinkElm;
				}
			});
		}
		return result;
	}

	//todo: should be generalized
	function getCommitColor(commitComment) {
		let cmt = commitComment.toLowerCase();
		let color = '#bbb';
		if (cmt.indexOf('defect ') === 0 || cmt.indexOf('defect:') === 0 || cmt.indexOf('bug ') === 0 || cmt.indexOf('bug:') === 0) {
			color = '#f88';
		} else if (cmt.indexOf('user story ') === 0 || cmt.indexOf('story ') === 0 || cmt.indexOf('us ') === 0 || cmt.indexOf('u.s ') === 0 || cmt.indexOf('u.s. ') === 0 || cmt.indexOf('feature ') === 0) {
			color = '#fc6';
		// } else if (cmt.indexOf('tech ') === 0 || cmt.indexOf('tech: ') === 0 || cmt.indexOf('[tech] ') === 0) {
		// 	color = '#9ad';
		} else if (cmt.indexOf('oops!') !== -1) {
			color = '#9c9';
		}
		return color;
	}

	function displayBuildCommiters(buildNumber) {
		let bi = buildInfos[buildNumber];
		let buildLinkElm = getBuildLinkElement(buildNumber);
		if (!buildLinkElm) {
			return;
		}
		let parentElm = buildLinkElm.parentElement.parentElement.parentElement;
		let commitersElm = document.createElement('div');
		commitersElm.className = 'jenkins-ext-build-commiters';
		if (bi.commiterInfos.length > 0) {
			bi.commiterInfos.forEach(ci => {
				let commiterLineElm = document.createElement('div');
				commiterLineElm.className = 'jenkins-ext-build-commiter-line';

				let skypeLinkElm = document.createElement('a');
				if (ci.email) {
					skypeLinkElm.setAttribute('href', 'sip:' + ci.email);
					skypeLinkElm.setAttribute('title', 'Skype ' + ci.name);
				} else {
					skypeLinkElm.setAttribute('title', 'No email defined for ' + ci.name);
				}
				skypeLinkElm.className = 'jenkins-ext-build-commiter-skype-link';
				let skypeImgElm = document.createElement('img');
				skypeImgElm.setAttribute('src', chrome.extension.getURL('img/skype.png'));
				skypeImgElm.className = 'jenkins-ext-build-commiter-skype-img';
				skypeLinkElm.appendChild(skypeImgElm);
				commiterLineElm.appendChild(skypeLinkElm);

				let mailLinkElm = document.createElement('a');
				if (ci.email) {
					mailLinkElm.setAttribute('href', 'mailto:' + ci.email);
					mailLinkElm.setAttribute('title', 'Email ' + ci.name);
				} else {
					mailLinkElm.setAttribute('title', 'No email defined for ' + ci.name);
				}
				mailLinkElm.className = 'jenkins-ext-build-commiter-email-link';
				let mailImgElm = document.createElement('img');
				mailImgElm.setAttribute('src', chrome.extension.getURL('img/email.png'));
				mailImgElm.className = 'jenkins-ext-build-commiter-email-img';
				mailLinkElm.appendChild(mailImgElm);
				commiterLineElm.appendChild(mailLinkElm);

				let nameElm = document.createElement('span');
				nameElm.className = 'jenkins-ext-build-commiter-name' + (highlightedCommiters.indexOf(ci.name.toLowerCase()) === -1 ? '' : ' jenkins-ext-build-commiter-name--highlight');
				nameElm.innerHTML = ci.name;
				let tooltip = '';
				let count = 0;
				ci.commits.forEach(c => {
					count++;
					if (count > 1) {
						tooltip += `---\n`;
					}
					tooltip += c.comment;
				});
				nameElm.setAttribute('title', tooltip);
				commiterLineElm.appendChild(nameElm);

				let commitsElm = document.createElement('div');
				commitsElm.className = 'jenkins-ext-build-commiter-commits';
				ci.commits.forEach(c => {
					let commitLinkElm = document.createElement('a');
					if (commitLinkPrefix) {
						commitLinkElm.setAttribute('href', commitLinkPrefix + c.id);
					}
					commitLinkElm.setAttribute('target', '_blank');
					commitLinkElm.setAttribute('title', c.comment);
					commitLinkElm.className = 'jenkins-ext-build-commiter-commit-link';
					commitLinkElm.innerHTML = c.fileCount;
					commitLinkElm.style['background-color'] = getCommitColor(c.comment);
					commitsElm.appendChild(commitLinkElm);
				});
				commiterLineElm.appendChild(commitsElm);

				commitersElm.appendChild(commiterLineElm);
			});
			parentElm.appendChild(commitersElm);
		} else {
			let commiterLineElm = document.createElement('div');
			commiterLineElm.className = 'jenkins-ext-build-commiter-line';

			let noCommitsElm = document.createElement('span');
			noCommitsElm.className = 'jenkins-ext-build-commiter-no-commits';
			noCommitsElm.innerHTML = 'No commits';
 			commiterLineElm.appendChild(noCommitsElm);

			commitersElm.appendChild(commiterLineElm);

			parentElm.appendChild(commitersElm);
		}
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

	function onGetBuildInfoDone(json, buildNumber) {
		let bi = buildInfos[buildNumber];
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
			info.builds.forEach(build => {
				buildInfos[build.number].status = getBuildStatus(build.number);
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
			//fixBuildNames();
			highlightedCommiters = (request.highlightCommiters || '').toLowerCase().split(',').map(Function.prototype.call, String.prototype.trim);
			commitLinkPrefix = request.commitLinkPrefix || '';
			getInfo(document.location.href + 'api/json', onGetRootJobInfoDone, null);
			// setTimeout(() => {
			// 		observeDOM(document.getElementById('buildHistory'), () => {
			// 			console.log('build history was changed');
			// 		});
			// }, 3000);
		}
	});

})();
