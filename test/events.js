'use strict'
/* global describe it  beforeEach afterEach */
/* eslint-disable no-unused-expressions */
const { expect } = require('chai')
const sinon = require('sinon')
const http = require('./support/http')
const db = require('./support/db')
const SocketHelper = require('./support/socket')
const discord = require('../app/discord')
require('./support/logger')

const { HTTP_OK } = require('../app/util/const')
describe('events', function() {

    // helper function
    async function createUserAndSocket(id) {
        await db.createUser({ id: 'u'+id, name: 'user' + id })
        const token = await db.createToken({ user_id: 'u' + id })
        const socket = new SocketHelper()
        await socket.connectAndEvents(process.env.HOST_URL + '/events?token=' + token.id)
        return socket
    }

    const sandbox = sinon.createSandbox()
    beforeEach(async function() {
        await db.init()
        await http.start()
    })

    afterEach(function() {
        sandbox.restore()
    })

    it('should return the events page', async function() {
        const req = http.request()
        const res = await req.get('/events/')
        expect(res.status).to.equal(HTTP_OK)

    })

    it('should receive the token after connect', async function() {

        // create the token
        const t = await db.createToken()
        const s = new SocketHelper()
        const res = await s.connect(process.env.HOST_URL + '/events?token='+t.id)
        expect(res).to.exist
        expect(res.id).to.equal(t.id)
    })


    it('should receive an update after connect', async function() {

        // create the token
        const t = await db.createToken()
        const s = new SocketHelper()
        const res = await s.connectAndEvents(process.env.HOST_URL + '/events?token='+t.id)
        expect(res).to.exist
    })

    it('should send an error if the token does not exist', async function() {

        const s = new SocketHelper()
        const res = await s.connect(process.env.HOST_URL + '/events?token=1')
        expect(res.error).to.exist

    })

    it('should send a create message', async function() {

        sandbox.stub(discord, 'sendCreateMessage')
        // create group
        await db.createGroup({ id: '1', name: 'destiny'})
        // create user1
        const s1 = await createUserAndSocket(1)
        // create the event
        await s1.create({ id: 1, name: 'test event', group_id: '1' })
        // check that we sent a create message

        expect(discord.sendCreateMessage.callCount).to.equal(1)

    })

    it('should send a join message', async function() {

        sandbox.stub(discord, 'sendJoinMessage')
        // create group
        await db.createGroup({ id: '1', name: 'destiny'})
        // create user1
        const s1 = await createUserAndSocket(1)
        // create the event
        await s1.create({ id: 1, name: 'test event', group_id: '1' })
        // create user2
        const s2 = await createUserAndSocket(2)
        // join user2
        await s2.join({ event_id: 1, type: 'participant'})
        // check that we sent a join message
        expect(discord.sendJoinMessage.callCount).to.equal(1)

    })

    it('should join as a participant', async function() {

        sandbox.stub(discord, 'sendJoinMessage')
        // create group
        await db.createGroup({ id: '1', name: 'destiny'})
        // create user1
        const s1 = await createUserAndSocket(1)
        // create the event
        await s1.create({ id: 1, name: 'test event', group_id: '1' })
        // create user2
        const s2 = await createUserAndSocket(2)
        // join user2
        await s2.join({ event_id: 1, type: 'participant'})
        // check that we joined as a participant
        const join = await db.Event.query().eager('[participants]').findById(1)
        expect(join.participants).to.have.length(2)
        expect(join.participants[1].id).to.equal('u2')

    })

    it('should join as an alternative', async function() {

        sandbox.stub(discord, 'sendJoinMessage')
        // create group
        await db.createGroup({ id: '1', name: 'destiny'})
        // create user1
        const s1 = await createUserAndSocket(1)
        // create the event
        await s1.create({ id: 1, name: 'test event', group_id: '1' })
        // create user2
        const s2 = await createUserAndSocket(2)
        // join user2
        await s2.join({ event_id: 1, type: 'alternative'})
        // check that we joined as an alternative
        const join = await db.Event.query().eager('[alternatives]').findById(1)
        expect(join.alternatives).to.have.length(1)
        expect(join.alternatives[0].id).to.equal('u2')

    })

    it('should join as an alternative when the squad is full', async function() {

        sandbox.stub(discord, 'sendJoinMessage')
        // create group
        await db.createGroup({ id: '1', name: 'destiny'})
        // create user1
        const s1 = await createUserAndSocket(1)
        // create the event
        await s1.create({ id: 1, name: 'test event', group_id: '1', max_participants: 2  })
        // create user2
        const s2 = await createUserAndSocket(2)
        // join user2
        await s2.join({ event_id: 1, type: 'participant'})
        // create user3
        const s3 = await createUserAndSocket(3)
        // join user2
        await s3.join({ event_id: 1, type: 'participant'})
        // check that we joined as an alternative
        const join = await db.Event.query().eager('[alternatives]').findById(1)
        expect(join.alternatives).to.have.length(1)
        expect(join.alternatives[0].id).to.equal('u3')

    })

    it.skip('should send a leave message', async function() {
        // create user 1
        // create the event
        // create user2
        // join user2
        // leave user2
        // check that we sent a leave message
    })

    it.skip('should send a delete message', async function() {

        // create user1
        // create the event
        // leave user1

        // check that we did not send a leave message
        // check that we sent a delete message
    })

    it.skip('should promote the next user when the owner leaves', async function() {

        // create user1
        // create the event
        // create user2
        // join user2
        // leave user1
        // check that we did not send a leave message
        // check that we sent a promote message
        // check that user2 is owner
    })

    it('should broadcast an update after an event is created', async function() {

        sandbox.stub(discord, 'sendCreateMessage')
        // create group
        await db.createGroup({ id: '1', name: 'destiny'})

        const s1 = await createUserAndSocket(1)
        const s2 = await createUserAndSocket(2)
        const s3 = await createUserAndSocket(3)

        // create the event and await the update
        const res = await Promise.all([
            s2.events(), s3.events(), await s1.create({ id: 1, name: 'test event', group_id: '1' })
        ])

        expect(res).to.exist

    })

    it.skip('should broadcast an update after an event is joined', async function() {

    })

    it.skip('should broadcast an update after an event is left', async function() {

    })

    it.skip('should broadcast an update after an event is deleted', async function() {

    })
   

})