importScripts('https://storage.googleapis.com/workbox-cdn/releases/6.2.4/workbox-sw.js');

if (workbox) {
    // Note: Ignore the error that Glitch raises about workbox being undefined.
    // workbox.setConfig({
    //     debug: true,
    // });

    // Precaching für wichtige Ressourcen
    workbox.precaching.precacheAndRoute([
        {url: '/', revision: '5'},
        {url: '/dashboard', revision: '5'},
        {url: '/images/favicon/site.webmanifest', revision: '5'},
        // Fügen Sie hier weitere Ressourcen hinzu, die Sie cachen möchten
    ]);

    // This immediately deploys the service worker w/o requiring a refresh
    self.skipWaiting();
    workbox.core.clientsClaim();

    // Cache-Strategie für alle Ressourcen außer /api/
    workbox.routing.registerRoute(
        new RegExp('^(?!.*\\/api\\/).*'),
        new workbox.strategies.CacheFirst({
            cacheName: 'cache',
            plugins: [
                new workbox.expiration.ExpirationPlugin({
                    maxEntries: 1000,
                    maxAgeSeconds: 30 * 24 * 60 * 60,
                }),
            ],
        })
    );

    // Netzwerk-Only-Strategie für Anfragen an /api/
    workbox.routing.registerRoute(
        new RegExp('/api/'),
        new workbox.strategies.NetworkFirst()
    );

    // Offline Seite
    workbox.routing.setCatchHandler(({event}) => {
        switch (event.request.destination) {
            case 'document':
                return caches.match('/dashboard');
            default:
                return Response.error();
        }
    });
}