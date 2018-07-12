'use strict'
/* global describe it  beforeEach afterEach */
/* eslint-disable no-unused-expressions */
const { expect } = require('chai')
const sinon = require('sinon')
const logger = require('../app/util/logger')
logger.transports.forEach((t) => (t.silent = true))

describe('generate token', function() {

    //const Discord = require('discord.js')
    const { messageHandler } = require('../app') // setup the listeners
    const sandbox = require('sinon').createSandbox()
    beforeEach(function() {
        
    })

    afterEach(function() {
        sandbox.restore()
    })

    it('shounld send a DM with a token', async function() {
        process.env.HOST_URL = 'http://127.0.0.1:1234'
        const msg = {
            content: '!team',
            id: '1234',
            delete: sinon.stub(),
            author: { send: sinon.stub() }
        }
        await messageHandler(msg)

        expect(msg.delete.called).to.be.true
        expect(msg.author.send.called).to.be.true
        expect(msg.author.send.calledWith(sinon.match(process.env.HOST_URL+'/auth/'))).to.be.true
    })

})