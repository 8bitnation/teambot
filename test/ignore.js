'use strict'
/* global describe it  beforeEach afterEach */
/* eslint-disable no-unused-expressions */
const { expect } = require('chai')
const sinon = require('sinon')
const logger = require('../app/util/logger')
logger.transports.forEach((t) => (t.silent = true))

describe('ignore', function() {

    //const Discord = require('discord.js')
    const { messageHandler } = require('../app/discord') // setup the listeners
    const sandbox = require('sinon').createSandbox()
    beforeEach(function() {
        
    })

    afterEach(function() {
        sandbox.restore()
    })

    it('should ignore ?team', async function() {

        const msg = {
            content: '?team',
            id: '1234',
            delete: sinon.stub()
        }
        await messageHandler(msg)

        expect(msg.delete.notCalled).to.be.true 

    })

    it('should not ignore !team', async function() {
        const msg = {
            content: '!team',
            id: '1234',
            delete: sinon.stub(),
            author: { id: '4567', send: sinon.stub() },
            channel: { id: '3456', name: 'destiny_lfg' }
        }
        await messageHandler(msg)

        expect(msg.delete.called).to.be.true 
    })

    it('should not ignore /team', async function() {
        const msg = {
            content: '/team',
            id: '1234',
            delete: sinon.stub(),
            author: { id: '4567', send: sinon.stub() },
            channel: { id: '3456', name: 'destiny_lfg' }
        }
        await messageHandler(msg)

        expect(msg.delete.called).to.be.true 
    })
})