'use strict'

const io = require('socket.io-client')

class SocketHelper {

    connect(url) {
        return new Promise( (resolve) => {
            this.socket = io(url, {forceNew: true})
            this.socket.once('token', resolve)
        })
    }

    connectAndEvents(url) {
        return new Promise( (resolve) => {
            this.socket = io(url, {forceNew: true})
            this.socket.once('events', resolve)
        })
    }

    events() {
        return new Promise( (resolve) => {
            this.socket.once('events', resolve)
        })
    }

    create(event) {
        return new Promise( (resolve) => {
            this.socket.once('events', resolve)
            this.socket.emit('create', event)
        })
    }
}

module.exports = SocketHelper