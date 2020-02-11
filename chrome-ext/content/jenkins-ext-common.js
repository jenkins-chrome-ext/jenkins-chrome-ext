//let extId = 'cjmholedpdghokadoionhngnmfpeebnk';
let buildResult = {
	SUCCESS:  'SUCCESS',
	FAILURE:  'FAILURE',
	UNSTABLE: 'UNSTABLE',
};
let buildInfos = {};
let fetchCache = {};

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
	const buildNumberDomElms = document.querySelectorAll('.build-row-cell .pane.build-name .display-name');
	if (buildNumberDomElms && buildNumberDomElms.length > 0) {
		let found = false;
		buildNumberDomElms.forEach(buildLinkElm => {
			if (!found && buildLinkElm.innerText.replace(/[^\x00-\x7F]/g, '').trim() === '#' + buildNumber) {
				found = true;
				result = buildLinkElm;
			}
		});
	}
	return result;
}
