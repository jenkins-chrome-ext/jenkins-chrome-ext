function cleanupZwsInsertedElements() {
    const zwsInsertedDomElms = document.querySelectorAll('.zws-inserted');
    if (zwsInsertedDomElms && zwsInsertedDomElms.length > 0) {
        zwsInsertedDomElms.forEach(zwsInsertedDomElm => {
            zwsInsertedDomElm.innerText = zwsInsertedDomElm.innerText.replace(/[\u200B]/g, '').trim();
        });
    }
}
