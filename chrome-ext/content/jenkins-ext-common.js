let buildResult = {
	SUCCESS:  'SUCCESS',
	FAILURE:  'FAILURE',
	UNSTABLE: 'UNSTABLE',
};
let buildInfos = {};
let fetchCache = {};

function getElm(selector) {
    return document.querySelector(selector);
}

async function goFetchJson(url) {
	try {
		if (!fetchCache[url]) {
			const res = await fetch(url);
			if (!fetchCache[url]) {
				fetchCache[url] = await res.json();
			}
		}
	} catch {
		fetchCache[url] = null;
	}
	return fetchCache[url] || null;
}

function getBuildLinkElement(buildNumber) {
	let result = null;
	const buildNumberDomElms = document.querySelectorAll('.app-builds-container__item__inner__link');
	if (buildNumberDomElms && buildNumberDomElms.length > 0) {
		let found = false;
		buildNumberDomElms.forEach(buildLinkElm => {
			if (!found && buildLinkElm.innerText.replace(/[^\x00-\x7F]/g, '').split('\n')[0].trim() === '#' + buildNumber) {
				found = true;
				result = buildLinkElm;
			}
		});
	}
	return result;
}




