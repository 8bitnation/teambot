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

    create(opts) {
        const event = Object.assign({
            id: 1, name: 'test event', platform_id: 'PC', group_id: '1', max_participants: 6,
            when: new Date().toISOString()
        }, opts)
        return new Promise( (resolve) => {
            this.socket.once('events', resolve)
            this.socket.emit('create', event)
        })
    }

    join(join) {
        return new Promise( (resolve) => {
            this.socket.once('events', resolve)
            this.socket.emit('join', join)
        })
    }

    leave(leave) {
        return new Promise( (resolve) => {
            this.socket.once('events', resolve)
            this.socket.emit('leave', leave)
        })
    }
}

module.exports = SocketHelper