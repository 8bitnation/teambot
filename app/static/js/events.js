'use strict'

/* global Vue */

/* eslint-disable-next-line no-unused-vars */
function startVue(token) {
    if(window.hasOwnPropery('Vue')) return new Vue({
        el: '#app',
        data: {
            token,
            inProgress: false,
            warning: {
                message: ''
            },
            error: {
                message: '',
                detail: '',
                detailVisible: false
            },
            channels: [],
            datePicker: {}
        
        }
    })
}
