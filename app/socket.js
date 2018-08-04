'use strict'

const logger = require('./util/logger')
const state = require('./state')
const EventEmitter = require('events')
const { Token } = require('./db')


module.exports = function(server) {
    const io = require('socket.io')(server)
    const nsp = io.of('/events')

    // we use the event emitter to inform all current
    // connections that they need to refresh the event data
    const ee = new EventEmitter()
    const MAX_LISTENERS = 200
    ee.setMaxListeners(MAX_LISTENERS)

    nsp.on('connection', async function (socket) {

        const token_id = socket.handshake.query.token
        logger.info('connection from %s, token: %s', socket.id, token_id)

        // go grab the token
        const token = await Token.query().findById(token_id)

        if(!token) {
            logger.error('failed to find token: %s', token_id)
            return socket.emit('token', { error: 'invalid token'})
        }

        logger.info('found token %j', token)

        // check if token has expired?

        async function pushUpdate() {
            const events = await state.events(token)
            socket.emit('events', events)
        }

        ee.on('update', pushUpdate)

        socket.emit('token', token)
        socket.emit('events', await state.events())

        // 
        socket.on('add', async function(event) {
            await state.addEvent(event)
            ee.emit('update')
        })

        socket.on('join', async function(event) {
            await state.joinEvent(event)
            ee.emit('update')
        })

        socket.on('leave', async function(event) {
            await state.leaveEvent(event)
            ee.emit('update')
        })

        socket.on('disconnect', function() {
            ee.removeListener('update', pushUpdate)
        })
    })

}


