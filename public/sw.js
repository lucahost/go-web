if(!self.define){const e=e=>{"require"!==e&&(e+=".js");let s=Promise.resolve();return r[e]||(s=new Promise((async s=>{if("document"in self){const r=document.createElement("script");r.src=e,document.head.appendChild(r),r.onload=s}else importScripts(e),s()}))),s.then((()=>{if(!r[e])throw new Error(`Module ${e} didn’t register its module`);return r[e]}))},s=(s,r)=>{Promise.all(s.map(e)).then((e=>r(1===e.length?e[0]:e)))},r={require:Promise.resolve(s)};self.define=(s,n,t)=>{r[s]||(r[s]=Promise.resolve().then((()=>{let r={};const a={uri:location.origin+s.slice(1)};return Promise.all(n.map((s=>{switch(s){case"exports":return r;case"module":return a;default:return e(s)}}))).then((e=>{const s=t(...e);return r.default||(r.default=s),r}))})))}}define("./sw.js",["./workbox-ea903bce"],(function(e){"use strict";importScripts("worker-BxmUB-utnjLJ8kfwHyrYP.js"),self.skipWaiting(),e.clientsClaim(),e.precacheAndRoute([{url:"/Go_-.svg",revision:"a3f49d8fd35e45d81149b875c0bb3519"},{url:"/Go_b.svg",revision:"83ec0657985aa26ecddb02885ab05c60"},{url:"/Go_bh.svg",revision:"5eafd2eb8a0e0186fc36bb6aa0b25df7"},{url:"/Go_d.svg",revision:"4159a864597daff066748a8ecc37d26e"},{url:"/Go_dl.svg",revision:"4bafaccf0ac55215a2c03e191841cde3"},{url:"/Go_dr.svg",revision:"3b4832f431699d3cb7c52fd83a932590"},{url:"/Go_l.svg",revision:"0228bdcae355bc07c5d8a323c827da05"},{url:"/Go_m.svg",revision:"ed71922c1bed77022270b6d10f8c19e9"},{url:"/Go_r.svg",revision:"ff03fc2781c89bf7918fa9ca60c51ff5"},{url:"/Go_u.svg",revision:"56076283b4ebc3ff2af40165c0e28d4d"},{url:"/Go_ul.svg",revision:"0b06db66391162a925ffb6bcb8b21f8d"},{url:"/Go_ur.svg",revision:"7ed07b8effde781506b6878eb9e30104"},{url:"/Go_w.svg",revision:"adc527415c3e11e9fd387b8762e32a37"},{url:"/Go_wh.svg",revision:"ffe599a896ecf6e1bb4da6e029a8fb05"},{url:"/_next/static/BxmUB-utnjLJ8kfwHyrYP/_buildManifest.js",revision:"BxmUB-utnjLJ8kfwHyrYP"},{url:"/_next/static/BxmUB-utnjLJ8kfwHyrYP/_ssgManifest.js",revision:"BxmUB-utnjLJ8kfwHyrYP"},{url:"/_next/static/chunks/433-377d2c3f8ad5a89461f9.js",revision:"BxmUB-utnjLJ8kfwHyrYP"},{url:"/_next/static/chunks/634-7eda68d2d94028bc4016.js",revision:"BxmUB-utnjLJ8kfwHyrYP"},{url:"/_next/static/chunks/800-b0702ef4230ddb977954.js",revision:"BxmUB-utnjLJ8kfwHyrYP"},{url:"/_next/static/chunks/commons-e5405eebf1bfb54cf691.js",revision:"BxmUB-utnjLJ8kfwHyrYP"},{url:"/_next/static/chunks/framework-80867e9864c452a7336b.js",revision:"BxmUB-utnjLJ8kfwHyrYP"},{url:"/_next/static/chunks/main-0249a31f5e4d0951e91b.js",revision:"BxmUB-utnjLJ8kfwHyrYP"},{url:"/_next/static/chunks/pages/_app-33c7dd6777da83c6cde3.js",revision:"BxmUB-utnjLJ8kfwHyrYP"},{url:"/_next/static/chunks/pages/_error-25fbb237fbd49c52752c.js",revision:"BxmUB-utnjLJ8kfwHyrYP"},{url:"/_next/static/chunks/pages/index-91099c36e67bb378d755.js",revision:"BxmUB-utnjLJ8kfwHyrYP"},{url:"/_next/static/chunks/polyfills-c04efade955df80c103c.js",revision:"BxmUB-utnjLJ8kfwHyrYP"},{url:"/_next/static/chunks/webpack-3c96d7b3eb5e8beac34b.js",revision:"BxmUB-utnjLJ8kfwHyrYP"},{url:"/favicon.ico",revision:"21b739d43fcb9bbb83d8541fe4fe88fa"},{url:"/manifest.json",revision:"50b0a99a29d2e094dcbf80b3d70787da"},{url:"/vercel.svg",revision:"26bf2d0adaf1028a4d4c6ee77005e819"}],{ignoreURLParametersMatching:[]}),e.cleanupOutdatedCaches(),e.registerRoute("/",new e.NetworkFirst({cacheName:"start-url",plugins:[{cacheWillUpdate:async({request:e,response:s,event:r,state:n})=>s&&"opaqueredirect"===s.type?new Response(s.body,{status:200,statusText:"OK",headers:s.headers}):s}]}),"GET"),e.registerRoute(/^https:\/\/fonts\.(?:googleapis|gstatic)\.com\/.*/i,new e.CacheFirst({cacheName:"google-fonts",plugins:[new e.ExpirationPlugin({maxEntries:4,maxAgeSeconds:31536e3,purgeOnQuotaError:!0})]}),"GET"),e.registerRoute(/\.(?:eot|otf|ttc|ttf|woff|woff2|font.css)$/i,new e.StaleWhileRevalidate({cacheName:"static-font-assets",plugins:[new e.ExpirationPlugin({maxEntries:4,maxAgeSeconds:604800,purgeOnQuotaError:!0})]}),"GET"),e.registerRoute(/\.(?:jpg|jpeg|gif|png|svg|ico|webp)$/i,new e.StaleWhileRevalidate({cacheName:"static-image-assets",plugins:[new e.ExpirationPlugin({maxEntries:64,maxAgeSeconds:86400,purgeOnQuotaError:!0})]}),"GET"),e.registerRoute(/\/_next\/image\?url=.+$/i,new e.StaleWhileRevalidate({cacheName:"next-image",plugins:[new e.ExpirationPlugin({maxEntries:64,maxAgeSeconds:86400,purgeOnQuotaError:!0})]}),"GET"),e.registerRoute(/\.(?:mp3|mp4)$/i,new e.StaleWhileRevalidate({cacheName:"static-media-assets",plugins:[new e.ExpirationPlugin({maxEntries:32,maxAgeSeconds:86400,purgeOnQuotaError:!0})]}),"GET"),e.registerRoute(/\.(?:js)$/i,new e.StaleWhileRevalidate({cacheName:"static-js-assets",plugins:[new e.ExpirationPlugin({maxEntries:32,maxAgeSeconds:86400,purgeOnQuotaError:!0})]}),"GET"),e.registerRoute(/\.(?:css|less)$/i,new e.StaleWhileRevalidate({cacheName:"static-style-assets",plugins:[new e.ExpirationPlugin({maxEntries:32,maxAgeSeconds:86400,purgeOnQuotaError:!0})]}),"GET"),e.registerRoute(/\/_next\/data\/.+\/.+\.json$/i,new e.StaleWhileRevalidate({cacheName:"next-data",plugins:[new e.ExpirationPlugin({maxEntries:32,maxAgeSeconds:86400,purgeOnQuotaError:!0})]}),"GET"),e.registerRoute(/\.(?:json|xml|csv)$/i,new e.NetworkFirst({cacheName:"static-data-assets",plugins:[new e.ExpirationPlugin({maxEntries:32,maxAgeSeconds:86400,purgeOnQuotaError:!0})]}),"GET"),e.registerRoute((({url:e})=>{if(!(self.origin===e.origin))return!1;const s=e.pathname;return!s.startsWith("/api/auth/")&&!!s.startsWith("/api/")}),new e.NetworkFirst({cacheName:"apis",networkTimeoutSeconds:10,plugins:[new e.ExpirationPlugin({maxEntries:16,maxAgeSeconds:86400,purgeOnQuotaError:!0})]}),"GET"),e.registerRoute((({url:e})=>{if(!(self.origin===e.origin))return!1;return!e.pathname.startsWith("/api/")}),new e.NetworkFirst({cacheName:"others",networkTimeoutSeconds:10,plugins:[new e.ExpirationPlugin({maxEntries:32,maxAgeSeconds:86400,purgeOnQuotaError:!0})]}),"GET")}));