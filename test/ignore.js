'use strict'
/* global describe it  beforeEach afterEach */
/* eslint-disable no-unused-expressions */
const { expect } = require('chai')
const sinon = require('sinon')
const logger = require('../app/util/logger')
logger.transports.forEach((t) => (t.silent = true))

describe('ignore anything but the builtin commands', function() {

    //const Discord = require('discord.js')
    const { messageHandler } = require('../app') // setup the listeners
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

    it('shound not ignore !team', async function() {
        const msg = {
            content: '!team',
            id: '1234',
            delete: sinon.stub()
        }
        await messageHandler(msg)

        expect(msg.delete.called).to.be.true 
    })

    it('shound not ignore /team', async function() {
        const msg = {
            content: '/team',
            id: '1234',
            delete: sinon.stub()
        }
        await messageHandler(msg)

        expect(msg.delete.called).to.be.true 
    })
})