'use strict'
/* global describe it  beforeEach afterEach */
/* eslint-disable no-unused-expressions */
const { expect } = require('chai')
const sinon = require('sinon')
const logger = require('../app/util/logger')
const db = require('./support/db')
const discord = require('../app/discord')
logger.transports.forEach((t) => (t.silent = true))

describe('roles', function() {

    const sandbox = sinon.createSandbox()
    beforeEach(async function() {
        await db.init()

        sandbox.stub(discord, 'lfgChannels').returns([
            { id: 'g1', name: 'destiny_lfg' },
            { id: 'g2', name: 'no_mans_sky_lfg'},
            { id: 'g3', name: 'the_division_lfg'},
            { id: 'g4', name: 'no_role_lfg'}
        ])

        sandbox.stub(discord, 'guildRoles').returns([
            { id: 'r1', name: 'Destiny', },
            { id: 'r2', name: 'No Mans Sky' },
            { id: 'r3', name: 'The Division' },
            { id: 'r10', name: 'Xbox' }, 
            { id: 'r11', name: 'PC'},
            { id: 'r12', name: 'Playstation' }, 
            { id: 'r13', name: 'Nintendo' },
            { id: 'r20', name: 'Moderator' }

        ])

    })

    afterEach(function() {
        sandbox.restore()
    })

    it('should return the correct groups', async function() {

        await discord.syncRoles()
        // userRoles
        sandbox.stub(discord, 'userRoles').returns([
            { id: 'r1', name: 'Destiny', },
            { id: 'r3', name: 'The Division' },
            { id: 'r10', name: 'Xbox' }, 
            { id: 'r11', name: 'PC'} 
        ])

        const groups = await discord.userGroups()

        expect(groups).to.deep.equal([{ id: 'g1'}, { id: 'g3'}])
    })

    it('should return the correct platforms', async function() {

        await discord.syncRoles()
        // userRoles
        sandbox.stub(discord, 'userRoles').returns([
            { id: 'r1', name: 'Destiny', },
            { id: 'r3', name: 'The Division' },
            { id: 'r10', name: 'Xbox' }, 
            { id: 'r11', name: 'PC'} 
        ])

        const platforms = await discord.userPlatforms()

        expect(platforms).to.deep.equal([{ id: 'XB'}, { id: 'PC'}])
    })

    it('should return all groups for a moderator', async function() {

        process.env.MOD_ROLE = 'Moderator'

        await discord.syncRoles()
        // userRoles
        sandbox.stub(discord, 'userRoles').returns([
            { id: 'r1', name: 'Destiny', },
            { id: 'r3', name: 'The Division' },
            { id: 'r10', name: 'Xbox' }, 
            { id: 'r11', name: 'PC'},
            { id: 'r20', name: 'Moderator' }
        ])

        const groups = await discord.userGroups()

        expect(groups).to.deep.equal([{ id: 'g1'}, { id: 'g2' }, { id: 'g3'}])
    })

    it('should return all platforms for a moderator', async function() {

        process.env.MOD_ROLE = 'Moderator'

        await discord.syncRoles()
        // userRoles
        sandbox.stub(discord, 'userRoles').returns([
            { id: 'r1', name: 'Destiny', },
            { id: 'r3', name: 'The Division' },
            { id: 'r10', name: 'Xbox' }, 
            { id: 'r11', name: 'PC'},
            { id: 'r20', name: 'Moderator' }
        ])

        const platforms = await discord.userPlatforms()

        expect(platforms).to.deep.equal([{ id: 'PC'}, { id: 'PS'}, { id: 'XB'}, { id: 'N'}])
    })


})