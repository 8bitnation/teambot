'use strict'

;(function() {
    // detect essential features used by event.js
    var hasDefineProperty = Boolean(Object.defineProperty)
    // 
    if(!hasDefineProperty) {
        var el = document.getElementById('detect')
        if(el) {
            el.style.display = 'block'
        }
    }
})()