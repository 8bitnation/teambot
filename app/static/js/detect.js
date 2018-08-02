'use strict'

;(function() {
    // detect essential features used by event.js
    var hasDefineProperty = Boolean(Object.defineProperty)
    var hasPromise = Boolean(window.Promise)
    // 
    if(!hasDefineProperty || !hasPromise) {
        var el = document.getElementById('detect')
        if(el) {
            el.style.display = 'block'
        }
    }
})()