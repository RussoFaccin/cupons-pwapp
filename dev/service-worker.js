var cacheName = 'cupons-pwapp_2019-01-07';
var filesToCache = [
    './',
    './index.html',
    './service-worker.js',
    './lib/vue.min.js',
    './js/app.js',
    './css/bootstrap-reboot.min.css',
    './css/bootstrap-reboot.min.css.map',
    './css/style.css',
    './img/menu-close.svg',
    './img/menu-open.svg',
    './img/left-arrow.svg',
    './data/ofertas.json',
    './fonts/proximanova-regular-webfont.woff',
    './fonts/proximanova-bold-webfont.woff',
    './fonts/proximanova-extrabold-webfont.woff'
];

self.addEventListener('install', (e) => {
    e.waitUntil(
        caches.open(cacheName)
        .then((cache) => {
            return cache.addAll(filesToCache);

        })
    )
});

self.addEventListener('activate', (e) => {
    e.waitUntil(
        caches.keys()
        .then((keyList) => {
            return Promise.all(
                keyList.map((key) => {
                    if (key != cacheName) {
                        return caches.delete(key);

                    }
                })
            )
        })
    );
    return self.clients.claim();
});

self.addEventListener('fetch', (e) => {
    e.respondWith(
        caches.match(e.request)
        .then(async (response) => {
            if (response) {
                return response;
              }
            //   await cacheResource(e.request);
              return await fetch(e.request);      
        })
    );
});

function cacheResource(resource) {
    return new Promise((resolve, reject) => {
        caches.open(cacheName)
            .then(cache => {
                cache.add(resource.url)
                    .then(response => {
                    }).catch(err => {
                        console.log('ERROR: ', err);
                    })
            })
    });
}