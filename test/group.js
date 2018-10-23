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

    // overwrite 
    const sandbox = sinon.createSandbox()
    beforeEach(async function() {
        await db.init()
    })

    afterEach(function() {
        sandbox.restore()
    })

    it('should create a new group', async function() {

        const guild = {
            channels: { 
                array: () => [
                    { id: '1', name: 'destiny_lfg', topic: '/team'}
                ]
            },
            roles: { 
                array: () => [
                    { id: '1', name: 'Destiny' }
                ]
            }
        }

        sandbox.stub(discord.client.guilds, 'get').returns(guild)

        await discord.syncRoles()

        const group = await db.Group.query().findById('1')
        expect(group).to.exist
        expect(group.name).to.equal('Destiny')
    })

    it('should create 2 new groups', async function() {

        const guild = {
            channels: { 
                array: () => [
                    { id: '1', name: 'destiny_lfg', topic: '/team' },
                    { id: '2', name: 'no_mans_sky_lfg', topic: '/team' }
                ]
            },
            roles: { 
                array: () => [
                    { id: '1', name: 'Destiny' },
                    { id: '2', name: 'No Mans Sky' }
                ]
            }
        }

        sandbox.stub(discord.client.guilds, 'get').returns(guild)

        await discord.syncRoles()

        const group1 = await db.Group.query().findById('1')
        expect(group1).to.exist
        expect(group1.name).to.equal('Destiny')

        const group2 = await db.Group.query().findById('2')
        expect(group2).to.exist
        expect(group2.name).to.equal('No Mans Sky')

    })

    it('should ignore a group without a role', async function() {

        const guild = {
            channels: { 
                array: () => [
                    { id: '1', name: 'destiny_lfg', topic: '/team' },
                    { id: '2', name: 'no_mans_sky_lfg', topic: '/team' }
                ]
            },
            roles: { 
                array: () => [
                    { id: '1', name: 'Destiny' }
                ]
            }
        }

        sandbox.stub(discord.client.guilds, 'get').returns(guild)

        await discord.syncRoles()

        const group1 = await db.Group.query().findById('1')
        expect(group1).to.exist
        expect(group1.name).to.equal('Destiny')

        const group2 = await db.Group.query().findById('2')
        expect(group2).to.not.exist

    })

    it('should ignore a group without /team in the topic', async function() {

        const guild = {
            channels: { 
                array: () => [
                    { id: '1', name: 'destiny_lfg', topic: '/team' },
                    { id: '2', name: 'no_mans_sky_lfg', topic: '' }
                ]
            },
            roles: { 
                array: () => [
                    { id: '1', name: 'Destiny' },
                    { id: '2', name: 'No Mans Sky' }
                ]
            }
        }

        sandbox.stub(discord.client.guilds, 'get').returns(guild)

        await discord.syncRoles()

        const group1 = await db.Group.query().findById('1')
        expect(group1).to.exist
        expect(group1.name).to.equal('Destiny')

        const group2 = await db.Group.query().findById('2')
        expect(group2).to.not.exist

    })

})