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
    let guild
    
    beforeEach(async function() {
        await db.init()

        guild = {
            channels: { 
                array: () => [
                    { id: 'c1', name: 'destiny_xb_lfg', topic: '/team' },
                    { id: 'c2', name: 'destiny_ps_lfg', topic: '/team' },
                    { id: 'c3', name: 'destiny_pc_lfg', topic: '/team' },
                    { id: 'c4', name: 'no_mans_sky_ps_lfg', topic: '/team' },
                    { id: 'c5', name: 'the_division_lfg', topic: '/team' },
                    { id: 'c6', name: 'no_role_lfg' }
                ]
            },
            roles: { 
                array: () => [
                    { id: 'r1', name: 'Destiny' },
                    { id: 'r2', name: 'No Mans Sky' },
                    { id: 'r3', name: 'The Division' },
                    { id: 'r10', name: 'Xbox' }, 
                    { id: 'r11', name: 'PC' },
                    { id: 'r12', name: 'Playstation' }, 
                    { id: 'r13', name: 'Nintendo' },
                    { id: 'r20', name: 'Moderator' }
                ]
            }
        }

        sandbox.stub(discord.client.guilds, 'get').returns(guild)

    })

    afterEach(function() {
        sandbox.restore()
    })


    it('should include groups for platform', async function() {

        // 
        guild.fetchMember = () => ({
            roles: {
                array: () => [
                    { id: 'r1', name: 'Destiny' },
                    { id: 'r2', name: 'No Mans Sky' },
                    { id: 'r3', name: 'The Division' },
                    { id: 'r12', name: 'Playstation' }
                ]
            },
            hasPermission: () => false
        })

        await discord.syncRoles()
        const groups = await discord.userGroups()

        expect(groups).to.deep.equal([{ id: 'r1'}, { id: 'r2' }, { id: 'r3'}])
    })

    it('should exclude groups for platform', async function() {

        // 
        guild.fetchMember = () => ({
            roles: {
                array: () => [
                    { id: 'r1', name: 'Destiny' },
                    { id: 'r2', name: 'No Mans Sky' },
                    { id: 'r3', name: 'The Division' },
                    { id: 'r10', name: 'Xbox' }, 
                    { id: 'r11', name: 'PC'} 
                ]
            },
            hasPermission: () => false
        })

        await discord.syncRoles()
        const groups = await discord.userGroups()

        expect(groups).to.deep.equal([{ id: 'r1'}, { id: 'r3'}])
    })

    it('should return the correct platforms', async function() {

        // 
        guild.fetchMember = () => ({
            roles: {
                array: () => [
                    { id: 'r1', name: 'Destiny' },
                    { id: 'r3', name: 'The Division' },
                    { id: 'r10', name: 'Xbox' }, 
                    { id: 'r11', name: 'PC'} 
                ]
            },
            hasPermission: () => false
        })

        await discord.syncRoles()
        const platforms = await discord.userPlatforms()

        expect(platforms).to.deep.equal([{ id: 'XB'}, { id: 'PC'}])
    })

    it('should return all groups for a moderator', async function() {

        process.env.MOD_ROLE = 'Moderator'
        guild.fetchMember = () => ({
            roles: {
                array: () => [
                    { id: 'r1', name: 'Destiny' },
                    { id: 'r3', name: 'The Division' },
                    { id: 'r10', name: 'Xbox' }, 
                    { id: 'r11', name: 'PC'},
                    { id: 'r20', name: 'Moderator' }
                ]
            },
            hasPermission: () => false
        })
        await discord.syncRoles()

        const groups = await discord.userGroups()

        expect(groups).to.deep.equal([{ id: 'r1'}, { id: 'r2' }, { id: 'r3'}])
    })

    it('should return all groups for an admin', async function() {

        guild.fetchMember = () => ({
            roles: {
                array: () => [
                    { id: 'r1', name: 'Destiny' },
                    { id: 'r3', name: 'The Division' },
                    { id: 'r10', name: 'Xbox' }, 
                    { id: 'r11', name: 'PC'}
                ]
            },
            hasPermission: () => true
        })
        await discord.syncRoles()

        const groups = await discord.userGroups()

        expect(groups).to.deep.equal([{ id: 'r1'}, { id: 'r2' }, { id: 'r3'}])
    })

    it('should return all platforms for a moderator', async function() {

        process.env.MOD_ROLE = 'Moderator'
        guild.fetchMember = () => ({
            roles: {
                array: () => [
                    { id: 'r1', name: 'Destiny' },
                    { id: 'r3', name: 'The Division' },
                    { id: 'r10', name: 'Xbox' }, 
                    { id: 'r11', name: 'PC'},
                    { id: 'r20', name: 'Moderator' }
                ]
            },
            hasPermission: () => false
        })
        await discord.syncRoles()

        const platforms = await discord.userPlatforms()

        expect(platforms).to.deep.equal([{ id: 'PC'}, { id: 'PS'}, { id: 'XB'}, { id: 'N'}])
    })

    it('should return all platforms for an admin', async function() {

        guild.fetchMember = () => ({
            roles: {
                array: () => [
                    { id: 'r1', name: 'Destiny' },
                    { id: 'r3', name: 'The Division' },
                    { id: 'r10', name: 'Xbox' }, 
                    { id: 'r11', name: 'PC'}
                ]
            },
            hasPermission: () => true
        })
        await discord.syncRoles()

        const platforms = await discord.userPlatforms()

        expect(platforms).to.deep.equal([{ id: 'PC'}, { id: 'PS'}, { id: 'XB'}, { id: 'N'}])
    })


})