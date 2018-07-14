'use strict'
/* global describe it  beforeEach afterEach */
/* eslint-disable no-unused-expressions */
const { expect } = require('chai')
const sinon = require('sinon')
const logger = require('../app/util/logger')
const db = require('./support/db')
logger.transports.forEach((t) => (t.silent = true))

describe('generate token', function() {

    //const Discord = require('discord.js')
    const { messageHandler } = require('../app/discord') // setup the listeners
    const sandbox = require('sinon').createSandbox()
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

})