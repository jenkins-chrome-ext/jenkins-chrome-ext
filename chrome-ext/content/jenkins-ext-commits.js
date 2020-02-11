let myName = '';
let highlightedNames = [];
let commitUrlPrefix = '';
let greenCommitMessagePattern = '';
let yellowCommitMessagePattern = '';
let redCommitMessagePattern = '';
let blueCommitMessagePattern = '';
let purpleCommitMessagePattern = '';

function formatCommiterName(commitAuthor) {
	let commiterName = commitAuthor.replace(/[,]/g, '');
	commiterName = commiterName.replace(/[._]/g, ' ');
	commiterName = commiterName.replace(/\w\S*/g, function(txt) {
		return txt.charAt(0).toUpperCase() + txt.substr(1);
	});
	return commiterName.trim();
}

function getCommitColor(commitComment) {
	let cmt = commitComment.toLowerCase();
	let color = '#bbb';
	if (greenCommitMessagePattern && new RegExp(greenCommitMessagePattern, 'img').test(cmt)) {
		color = '#9c9';
	} else if (yellowCommitMessagePattern && new RegExp(yellowCommitMessagePattern, 'img').test(cmt)) {
		color = '#fc6';
	} else if (redCommitMessagePattern && new RegExp(redCommitMessagePattern, 'img').test(cmt)) {
		color = '#f88';
	} else if (blueCommitMessagePattern && new RegExp(blueCommitMessagePattern, 'img').test(cmt)) {
		color = '#aaf';
	} else if (purpleCommitMessagePattern && new RegExp(purpleCommitMessagePattern, 'img').test(cmt)) {
		color = '#daf';
	}
	return color;
}

function getNewCommiterLineElm(ci) {
	let commiterLineElm = document.createElement('div');
	commiterLineElm.className = 'jenkins-ext-build-commiter-line';

	let chatLinkElm = document.createElement('a');
	if (ci.email) {
		chatLinkElm.setAttribute('href', 'sip:' + ci.email);
		chatLinkElm.setAttribute('title', 'Chat with ' + ci.name);
	} else {
		chatLinkElm.setAttribute('title', 'No email defined for ' + ci.name);
	}
	chatLinkElm.className = 'jenkins-ext-build-commiter-chat-link';
	let chatImgElm = document.createElement('img');
	chatImgElm.setAttribute('src', chrome.extension.getURL('img/chat.png'));
	chatImgElm.className = 'jenkins-ext-build-commiter-chat-img';
	chatLinkElm.appendChild(chatImgElm);
	commiterLineElm.appendChild(chatLinkElm);

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

	let nameElm = document.createElement('div');
	nameElm.className = 'jenkins-ext-build-commiter-name';
	if (ci.name.toLowerCase().trim() === myName) {
		nameElm.className += ' jenkins-ext-build-commiter-name--me';
	} else if (highlightedNames.indexOf(ci.name.toLowerCase()) !== -1) {
		nameElm.className += ' jenkins-ext-build-commiter-name--highlight';
	}
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
		if (commitUrlPrefix) {
			commitLinkElm.setAttribute('href', commitUrlPrefix + c.id);
		}
		commitLinkElm.setAttribute('target', '_blank');
		commitLinkElm.setAttribute('title', c.comment);
		commitLinkElm.className = 'jenkins-ext-build-commiter-commit-link';
		commitLinkElm.innerHTML = c.fileCount;
		commitLinkElm.style['background-color'] = getCommitColor(c.comment);
		commitsElm.appendChild(commitLinkElm);
	});
	commiterLineElm.appendChild(commitsElm);
	return commiterLineElm;
}

function getAllCommitersLineElm(commiterInfos) {
	let hrefStr;
	let commiterLineElm = document.createElement('div');
	commiterLineElm.className = 'jenkins-ext-build-commiter-line';

	let chatLinkElm = document.createElement('a');
	hrefStr = 'im:';
	commiterInfos.forEach(ci => {
		if (ci.email && ci.name.toLowerCase().trim() !== myName) {
			hrefStr += '<sip:' + ci.email + '>';
		}
	});
	chatLinkElm.setAttribute('href', hrefStr);
	chatLinkElm.setAttribute('title', 'Group Chat');
	chatLinkElm.className = 'jenkins-ext-build-commiter-chat-link';
	let chatImgElm = document.createElement('img');
	chatImgElm.setAttribute('src', chrome.extension.getURL('img/chat.png'));
	chatImgElm.className = 'jenkins-ext-build-commiter-chat-img';
	chatLinkElm.appendChild(chatImgElm);
	commiterLineElm.appendChild(chatLinkElm);

	let mailLinkElm = document.createElement('a');
	hrefStr = 'mailto:';
	commiterInfos.forEach(ci => {
		if (ci.email && ci.name.toLowerCase().trim() !== myName) {
			hrefStr += ci.email + ';';
		}
	});
	mailLinkElm.setAttribute('href', hrefStr);
	mailLinkElm.setAttribute('title', 'Group Email');
	mailLinkElm.className = 'jenkins-ext-build-commiter-email-link';
	let mailImgElm = document.createElement('img');
	mailImgElm.setAttribute('src', chrome.extension.getURL('img/email.png'));
	mailImgElm.className = 'jenkins-ext-build-commiter-email-img';
	mailLinkElm.appendChild(mailImgElm);
	commiterLineElm.appendChild(mailLinkElm);

	let nameElm = document.createElement('span');
	nameElm.className = 'jenkins-ext-build-commiter-name';
	nameElm.innerHTML = '*';
	nameElm.setAttribute('title', 'All commiters');
	commiterLineElm.appendChild(nameElm);

	return commiterLineElm;
}

function getNoCommitsLineElm() {
	let commiterLineElm = document.createElement('div');
	commiterLineElm.className = 'jenkins-ext-build-commiter-line';

	let noCommitsElm = document.createElement('span');
	noCommitsElm.className = 'jenkins-ext-build-commiter-no-commits';
	noCommitsElm.innerHTML = 'No commits';
	commiterLineElm.appendChild(noCommitsElm);

	return commiterLineElm;
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
			let commiterLineElm = getNewCommiterLineElm(ci);
			commitersElm.appendChild(commiterLineElm);
		});

		if (bi.commiterInfos.length > 1) {
			let allCommitersLineElm = getAllCommitersLineElm(bi.commiterInfos);
			commitersElm.appendChild(allCommitersLineElm);
		}
		parentElm.appendChild(commitersElm);
	} else {
		let commiterLineElm = getNoCommitsLineElm();
		commitersElm.appendChild(commiterLineElm);
		parentElm.appendChild(commitersElm);
	}
}
