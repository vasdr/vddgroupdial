// Service Worker para Manifest V3
chrome.runtime.onInstalled.addListener((details: chrome.runtime.InstalledDetails) => {
    if (details.reason === 'install') {
        console.log('vddgroupdial instalado con éxito.');
    }

    // Crear el menú contextual
    chrome.contextMenus.create({
        id: 'gsd-add-dial',
        title: 'Añadir página a vddgroupdial',
        contexts: ['page']
    });
});

chrome.contextMenus.onClicked.addListener((info, tab) => {
    if (info.menuItemId === 'gsd-add-dial' && tab?.url) {
        const urlParam = encodeURIComponent(tab.url);
        const titleParam = encodeURIComponent(tab.title || tab.url);

        // Abrir popup.html como una ventana externa real centrada
        chrome.windows.create({
            url: `popup.html?url=${urlParam}&title=${titleParam}`,
            type: 'popup',
            width: 400,
            height: 480
        });
    }
});
