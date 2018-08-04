'use strict'
/* global describe it  beforeEach afterEach */
/* eslint-disable no-unused-expressions */
const { expect } = require('chai')
const sinon = require('sinon')
const http = require('./support/http')
const db = require('./support/db')
const SocketHelper = require('./support/socket')
require('./support/logger')

const { HTTP_OK } = require('../app/util/const')
describe('events', function() {

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

    it('should recieve the token after connect', async function() {

        // create the token
        const t = await db.createToken()
        const s = new SocketHelper()
        const res = await s.connect(process.env.HOST_URL + '/events?token='+t.id)
        expect(res).to.exist
        expect(res.id).to.equal(t.id)
    })


    it('should recieve an update after connect', async function() {

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

    it('should broadcast an update after an event is created', async function() {

        await db.createUser({ id: 'u1', name: 'user1' })
        const t1 = await db.createToken({ user_id: 'u1' })
        const s1 = new SocketHelper()
        await s1.connect(process.env.HOST_URL + '/events?token=' + t1.id)
        
        await db.createUser({ id: 'u2', name: 'user2' })
        const t2 = await db.createToken({ user_id: 'u2' })
        const s2 = new SocketHelper()
        await s2.connect(process.env.HOST_URL + '/events?token=' + t2.id)

        await db.createUser({ id: 'u3', name: 'user3' })
        const t3 = await db.createToken({ user_id: 'u3' })
        const s3 = new SocketHelper()
        await s3.connectAndEvents(process.env.HOST_URL + '/events?token=' + t3.id)


        s1.add({ id: 1 })

        const res = await Promise.all([
            s1.events(), s2.events(), s3.events()
        ])

        expect(res).to.exist

    })

})