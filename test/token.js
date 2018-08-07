'use strict'
/* global describe it  beforeEach afterEach */
/* eslint-disable no-unused-expressions */
const { expect } = require('chai')
const sinon = require('sinon')
const db = require('./support/db')
require('./support/logger')

describe('token', function() {

    //const Discord = require('discord.js')
    const { messageHandler } = require('../app/discord') // setup the listeners
    const sandbox = sinon.createSandbox()
    beforeEach(async function() {
        await db.init()
    })

    afterEach(function() {
        sandbox.restore()
    })

    it('should send a DM with a token', async function() {
        process.env.HOST_URL = 'http://127.0.0.1:1234'
        const msg = {
            content: '!team',
            id: '1234',
            delete: sinon.stub(),
            author: { id: '4567', send: sinon.stub(), username: 'testuser' },
            member: { nickname: 'testusernick' },
            channel: { id: '3456', name: 'destiny_lfg' }
        }
        await messageHandler(msg)

        expect(msg.delete.called).to.be.true
        expect(msg.author.send.called).to.be.true
        expect(msg.author.send.calledWith(sinon.match(process.env.HOST_URL+'/auth/'))).to.be.true
    })

    it('should match the correct group', async function() {

        process.env.HOST_URL = 'http://127.0.0.1:1234'
        const msg = {
            content: '!team',
            id: '1234',
            delete: sinon.stub(),
            author: { id: '4567', send: sinon.stub(), username: 'testuser' },
            member: { nickname: 'testusernick' },
            channel: { id: '3456', name: 'destiny_lfg' }
        }

        await db.createGroup( { id: '3456', name: 'destiny' })
        await messageHandler(msg)

        expect(msg.delete.called).to.be.true
        expect(msg.author.send.called).to.be.true
        expect(msg.author.send.calledWith(sinon.match(process.env.HOST_URL+'/auth/'))).to.be.true
        // find the token
        const token = await db.Token.query().first().where({ user_id: '4567' })
        expect(token).to.exist
        expect(token.group_id).to.equal('3456')
    })

    it('should remove any previous tokens', async function() {

        const user = await db.createUser()
        await db.createToken({ id: 't1', user_id: user.id })
        await db.createToken({ id: 't2', user_id: user.id })

        process.env.HOST_URL = 'http://127.0.0.1:1234'
        const msg = {
            content: '!team',
            id: '1234',
            delete: sinon.stub(),
            author: { id: user.id, send: sinon.stub(), username: 'testuser' },
            member: { nickname: 'testusernick' },
            channel: { id: '3456', name: 'destiny_lfg' }
        }
        await messageHandler(msg)

        const tokens = await db.Token.query().where({ user_id: user.id })
        expect(tokens.length).to.equal(1)

    })

    it('should remove any previous messages', async function() {

        const user = await db.createUser( { id: '4567'})
        await db.createToken({ id: 't1', message_id: '1', user_id: user.id })
        await db.createToken({ id: 't2', message_id: '2', user_id: user.id })

        const dm = { delete: sinon.stub() }

        process.env.HOST_URL = 'http://127.0.0.1:1234'
        const msg = {
            content: '!team',
            id: '1234',
            delete: sinon.stub(),
            author: { 
                id: '4567', 
                send: sinon.stub(), 
                dmChannel: {
                    fetchMessage: sinon.stub().returns(dm)
                },
                username: 'testuser' 
            },
            member: { nickname: 'testusernick' },
            channel: { id: '3456', name: 'destiny_lfg' }
        }
        await messageHandler(msg)

        const NUM_MESSAGES = 2
        expect(msg.author.dmChannel.fetchMessage.callCount).to.equal(NUM_MESSAGES)
        expect(dm.delete.callCount).to.equal(NUM_MESSAGES)

    })




})