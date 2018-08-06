'use strict'
/* global describe it  beforeEach afterEach */
/* eslint-disable no-unused-expressions */
const { expect } = require('chai')
const sinon = require('sinon')
const logger = require('../app/util/logger')
const db = require('./support/db')
const discord = require('../app/discord')
logger.transports.forEach((t) => (t.silent = true))

describe('group', function() {

    const sandbox = sinon.createSandbox()
    beforeEach(async function() {
        await db.init()
    })

    afterEach(function() {
        sandbox.restore()
    })

    it('should create a new group', async function() {

        sandbox.stub(discord, 'lfgChannels').returns([
            { id: '1', name: 'destiny_lfg' }
        ])

        sandbox.stub(discord, 'guildRoles').returns([
            { id: '1', name: 'Destiny' }
        ])

        await discord.syncChannels()

        const group = await db.Group.query().findById('1')
        expect(group).to.exist
        expect(group.name).to.equal('destiny')
    })

})