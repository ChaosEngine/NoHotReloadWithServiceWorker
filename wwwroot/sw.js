//Simplie service worker using fetch() (but doing nothing with the cache really)

self.addEventListener('fetch', event => {
	event.respondWith(caches.match(event.request).then(cached_response => {

		return fetch(event.request).then(response => {

			return response;
		}).catch(() => {
			return cached_response;
		});

	}));
});
