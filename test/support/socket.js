'use strict'

const io = require('socket.io-client')

class SocketHelper {

    connect(url) {
        return new Promise( (resolve) => {
            this.socket = io(url, {forceNew: true})
            this.socket.on('token', resolve)
        })
    }

    connectAndEvents(url) {
        return new Promise( (resolve) => {
            this.socket = io(url, {forceNew: true})
            this.socket.on('events', resolve)
        })
    }

    events() {
        return new Promise( (resolve) => {
            this.socket.on('events', resolve)
        })
    }

    add(event) {
        this.socket.emit('add', event)
    }
}

module.exports = SocketHelper