// Please see documentation at https://docs.microsoft.com/aspnet/core/client-side/bundling-and-minification
// for details on configuring this project to bundle and minify static web assets.

// Write your JavaScript code.


/**
 * Registers service worker globally
 * @param {string} rootPath is a path of all pages after FQDN name (ex. https://foo-bar.com/rootPath) or '/' if no root path
 * @param {boolean} isDev indicates whether this is development (tru) or production (false) like environment
 */
function registerServiceWorker(rootPath, isDev) {
	if ('serviceWorker' in navigator
		//&& (navigator.serviceWorker.controller === null || navigator.serviceWorker.controller.state !== "activated")
	) {
		const swUrl = rootPath + 'sw' + (isDev === true ? '' : '.min') + '.js?domain=' + encodeURIComponent(rootPath) + '&isDev=' + encodeURIComponent(isDev);

		navigator.serviceWorker
			.register(swUrl, { scope: rootPath })
			.then(function () {
				console.log("Service Worker Registered");
			});

		navigator.serviceWorker
			.ready.then(function () {
				console.log('Service Worker Ready');
			});
	}
}

//HotReload is broken by ServiceWorker ????
registerServiceWorker('/', true);
