// ========================================
// BARIN PWA - Service Worker
// برند بارین | همراه لحظه‌های پرانرژی
// ========================================

// نام و نسخه حافظه کش
const CACHE_NAME = "barin-cache-v1";

// فایل‌های اصلی برنامه
const APP_FILES = [
    "./",
    "./index.html",
    "./style.css",
    "./manifest.json",
    "./icons/icon-192.png",
    "./icons/icon-512.png",
    "./icons/icon-192-maskable.png",
    "./icons/icon-512-maskable.png"
];


// ========================================
// INSTALL EVENT
// ذخیره فایل‌های اصلی در حافظه کش
// ========================================

self.addEventListener("install", (event) => {

    event.waitUntil(

        caches.open(CACHE_NAME).then((cache) => {

            return cache.addAll(APP_FILES);

        })

    );

    self.skipWaiting();

});


// ========================================
// ACTIVATE EVENT
// حذف کش‌های قدیمی
// ========================================

self.addEventListener("activate", (event) => {

    event.waitUntil(

        caches.keys().then((cacheNames) => {

            return Promise.all(

                cacheNames.map((cacheName) => {

                    if (cacheName !== CACHE_NAME) {

                        return caches.delete(cacheName);

                    }

                })

            );

        })

    );

    self.clients.claim();

});


// ========================================
// FETCH EVENT
// بارگذاری فایل‌ها از کش یا اینترنت
// ========================================

self.addEventListener("fetch", (event) => {

    // فقط درخواست‌های GET بررسی می‌شوند
    if (event.request.method !== "GET") {
        return;
    }

    // فقط درخواست‌های هم‌مبدأ
    const requestURL = new URL(event.request.url);

    if (requestURL.origin !== self.location.origin) {
        return;
    }

    event.respondWith(

        caches.match(event.request).then((cachedResponse) => {

            // اگر فایل در کش موجود باشد
            if (cachedResponse) {

                return cachedResponse;

            }

            // در غیر این صورت دریافت از اینترنت
            return fetch(event.request).then((networkResponse) => {

                // فقط پاسخ‌های معتبر ذخیره شوند
                if (
                    networkResponse &&
                    networkResponse.status === 200 &&
                    networkResponse.type === "basic"
                ) {

                    const responseToCache = networkResponse.clone();

                    caches.open(CACHE_NAME).then((cache) => {

                        cache.put(event.request, responseToCache);

                    });

                }

                return networkResponse;

            }).catch(() => {

                // در صورت قطع اینترنت
                if (event.request.mode === "navigate") {

                    return caches.match("./index.html");

                }

            });

        })

    );

});


// ========================================
// END OF BARIN SERVICE WORKER
// ========================================s
