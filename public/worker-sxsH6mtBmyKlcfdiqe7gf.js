(()=>{"use strict";self.addEventListener("push",(function(e){console.log("got update from web-push"),clients.matchAll({type:"window",includeUncontrolled:!0}).then((function(e){if(e.length>0){let t=e[0];for(let n=0;n<e.length;n++)e[n].focused&&(t=e[n]);return t.postMessage("game update"),t.focused}return clients.openWindow("/")}))})),self.addEventListener("notificationclick",(function(e){e.notification.close()}))})();