/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
var __webpack_exports__ = {};
/* eslint-disable no-undef */


self.addEventListener('push', function (event) {
  event.waitUntil(registration.showNotification('player update', {
    body: 'refresh the page to show new data'
  }));
});
self.addEventListener('notificationclick', function (event) {
  event.notification.close();
  event.waitUntil(clients.matchAll({
    type: 'window',
    includeUncontrolled: true
  }).then(function (clientList) {
    if (clientList.length > 0) {
      let client = clientList[0];

      for (let i = 0; i < clientList.length; i++) {
        if (clientList[i].focused) {
          client = clientList[i];
        }
      }

      client.postMessage('refresh');
      client.navigate('/');
      return client.focused;
    }

    return clients.openWindow('/');
  }));
});
/******/ })()
;