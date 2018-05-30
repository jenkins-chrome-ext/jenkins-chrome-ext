
let localStorageHighlightCommitersKey = 'jenkins-ext-highlight-commiters';
let highlightedCommiters = (localStorage.getItem(localStorageHighlightCommitersKey) || '').split(',').map(Function.prototype.call, String.prototype.trim);
let buildInfos = {};
let buildNumberDomElms = document.querySelectorAll('.build-row-cell .pane.build-name .display-name');

chrome.runtime.onMessage.addListener(function (request /*, sender, sendResponse*/) {
	if (request.type === 'jenkins-chrome-ext-highlight-commiters') {
		localStorage.setItem(localStorageHighlightCommitersKey, request.msg || '');
		highlightedCommiters = (request.msg || '').split(',').map(Function.prototype.call, String.prototype.trim);		
	}
});

function getInfo(url, cb, prm) {
	let xhr = new XMLHttpRequest();
	xhr.onreadystatechange = function() {
		if (xhr.readyState === 4) {
			let json = JSON.parse(xhr.response);
			cb(json, prm);
		}
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
		parentElm = buildLinkElm.parentElement.parentElement.parentElement;
		let commitersElm = document.createElement('div');
		commitersElm.className = 'jenkins-ext-build-commiters';
		commiterInfos.forEach(commmiterInfo => {
			let elm = document.createElement('a');
			elm.style['display'] = 'block';
			elm['href'] = 'mailto:' + commmiterInfo.email;
			elm.className = 'jenkins-ext-build-commiter' + (highlightedCommiters.indexOf(commmiterInfo.name) === -1 ? '' : ' jenkins-ext-build-commiter--highlight');
			elm.innerHTML = commmiterInfo.name;
			commitersElm.appendChild(elm);
		});
		parentElm.appendChild(commitersElm);
	}
}

function onGetBuildInfoDone(info, buildNumber) {
	let commiters = [];
	let commiterInfos = [];
	info.changeSet.items.forEach(commit => {
		let commiterName = formatCommiterName(commit.author.fullName);
		if (commiters.indexOf(commiterName) === -1) {
			commiters.push(commiterName);
			commiterInfos.push({
				name: commiterName,
				email: commit.authorEmail
			});
		}
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

setTimeout(function() {
	getInfo(document.location.href + 'api/json', onGetRootJobInfoDone, null);
}, 0);
