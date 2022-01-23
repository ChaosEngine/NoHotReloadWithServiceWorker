/* eslint-disable no-console */
"use strict";
//Offline mode service worker implementation

const CACHE_NAME = 'cache';

self.addEventListener('install', function (event) {
	const swUrl = new URL(self.location);
	const domain = swUrl.searchParams.get('domain');
	let isDev = swUrl.searchParams.get('isDev');
	isDev = isDev === true || isDev === "true" || isDev === 1 || isDev === "1" ? true : false;
	const suffix = '';//isDev ? '' : '.min';

	let RESOURCES = [
		`css/site${suffix}.css`,
		`js/site${suffix}.js`
	];

	if (isDev) {
		RESOURCES = RESOURCES.concat([
			`lib/jquery-validation/dist/jquery.validate${suffix}.js`,
			`lib/jquery-validation-unobtrusive/jquery.validate.unobtrusive${suffix}.js`
		]);
	}
	else {
		//cdn resources
		RESOURCES = RESOURCES.concat([
			//'https://cdn.jsdelivr.net/npm/jquery@3.5.1/dist/jquery.min.js',
			//'https://cdn.jsdelivr.net/npm/bootstrap@5.1.0/dist/js/bootstrap.bundle.min.js',
			//'https://cdnjs.cloudflare.com/ajax/libs/jquery-validate/1.17.0/jquery.validate.min.js',
			//'https://cdn.jsdelivr.net/npm/jquery-validation-unobtrusive@3.2.11/dist/jquery.validate.unobtrusive.min.js'
		]);
	}


	event.waitUntil(
		caches.open(CACHE_NAME).then(async (cache) => {
			//1st load cross-orign stuff with opaque response (risky but....)
			RESOURCES.filter(res => res.indexOf("http") === 0).map(async (crossOriginUrl) => {
				const crossRequest = new Request(crossOriginUrl, { mode: 'no-cors' });
				const response = await fetch(crossRequest);
				await cache.put(crossRequest, response);
			});
			//then load local domain requests
			await cache.addAll(RESOURCES.filter(res => res.indexOf("http") !== 0).map(localPath => {
				return domain + localPath;
			}));
		})
	);
});

self.addEventListener("activate", function (event) {
	event.waitUntil(
		caches.keys().then(function (allCacheNames) {
			return Promise.all(
				allCacheNames.map(function (cn) {
					if (CACHE_NAME !== cn) {
						console.log('Service Worker deleting cache ' + cn);
						return caches.delete(cn);
					}
				})
			);
		})
	);
});

self.addEventListener('fetch', event => {
	event.respondWith(caches.match(event.request, { ignoreVary: true }).then(cached_response => {
		// caches.match() always resolves
		// but in case of success response will have value
		// if (response)
		// 	return response;

		return fetch(event.request).then(response => {
			// Check if we received a valid response
			if (!response || response.status !== 200 || response.type !== 'basic') {
				return response || fetch(event.request);
			}

			if (event.request.method !== 'GET')
				return response;

			// response may be used only once
			// we need to save clone to put one copy in cache
			// and serve second one
			const responseClone = response.clone();

			caches.open(CACHE_NAME).then(cache => {
				cache.put(event.request, responseClone);
			});
			return response;
		}).catch(() => {
			//console.error(e, ' url: ' + event.request.url);
			return cached_response;
		});

	}));
});
