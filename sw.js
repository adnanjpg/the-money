const cacheName = 'themoney-v1'
const staticAssets = [
  // main code
  './index.html',
  './index.css',
  './index.js',
  // logos
  './assets/logo/logo192.png',
  './assets/logo/logo512.png',
  // json data
  './data/items.json',
  './data/ppl.json',
  // items imgs
  './data/imgs/items/1.jpeg',
  './data/imgs/items/2.jpeg',
  './data/imgs/items/3.webp',
  './data/imgs/items/4.jpeg',
  './data/imgs/items/5.jpeg',
  './data/imgs/items/6.jpeg',
  './data/imgs/items/7.jpeg',
  './data/imgs/items/8.jpg',
  './data/imgs/items/9.jpeg',
  './data/imgs/items/10.jpeg',
  './data/imgs/items/11.webp',
  './data/imgs/items/12.jpeg',
  './data/imgs/items/13.jpeg',
  './data/imgs/items/14.webp',
  './data/imgs/items/15.png',
  './data/imgs/items/16.webp',
  './data/imgs/items/17.webp',
  // ppl imgs
  './data/imgs/ppl/1.webp',
  './data/imgs/ppl/2.webp',
  './data/imgs/ppl/3.webp',
  './data/imgs/ppl/4.webp',
  './data/imgs/ppl/5.webp',
]

self.addEventListener('install', async (e) => {
  const cache = await caches.open(cacheName)
  await cache.addAll(staticAssets)
  return self.skipWaiting()
})

self.addEventListener('activate', (e) => {
  self.clients.claim()
})

self.addEventListener('fetch', async (e) => {
  const req = e.request
  const url = new URL(req.url)
  if ((url.origin = location.origin)) {
    e.respondWith(cacheFirst(req))
  } else {
    e.respondWith(networkAndCache(req))
  }
})

async function cacheFirst(req) {
  const cache = await caches.open(cacheName)
  const cached = await cache.match(req)
  return cached || fetch(req)
}
async function networkAndCache(req) {
  const cache = await caches.open(cacheName)
  try {
    const fresh = await fetch(req)
    await cache.put(req, fresh.clone())
    return fresh
  } catch (e) {
    const cached = await cache.match(req)
    return cached
  }
}
