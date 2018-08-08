'use strict'
/* eslint-disable no-magic-numbers */

const { Model } = require('objection')
const { User, Group, Event, Platform, Token } = require('../../app/db')
// create some sample users and events for development purposes
// DO NOT RUN THIS ON A LIVE SYSTEM!

// if you want to use it then try the following:

// rm db/teambot.sqlite;npm run knex migrate:latest;npm run knex seed:run


function future(hours) {
    const now = Date.now()

    const MS_IN_HOUR = 3600000
    const future = now + (hours * MS_IN_HOUR)

    return new Date(future).toISOString()

}

exports.seed = async function(knex) {

    Model.knex(knex)

    // sanity check
    const users = await User.query().select()
    if(users.length) throw new Error('Database not empty!')

    await Group.query().insert({ id: 'g1', role_id: 'r1', name: 'destiny'})
    await Group.query().insert({ id: 'g2', role_id: 'r2', name: 'warframe'})
    await Group.query().insert({ id: 'g3', role_id: 'r3', name: 'no mans sky'})

    await User.query().insert({ id: 'u1', name: 'Retro'})
    await User.query().insert({ id: 'u2', name: 'BngPlz'})
    await User.query().insert({ id: 'u3', name: 'Zepto'})
    await User.query().insert({ id: 'u4', name: 'Zuel'})
    await User.query().insert({ id: 'u5', name: 'Uncle'})
    await User.query().insert({ id: 'u6', name: 'Morf'})
    await User.query().insert({ id: 'u7', name: 'Geeky'})

    // destiny group
    await Group.query().upsertGraph({
        id: 'g1', 
        users: [
            { id: 'u1' }, { id: 'u2' }, { id: 'u3' },
            { id: 'u4' }, { id: 'u5' }, { id: 'u6' },
            { id: 'u7' }
        ]
    },  { relate: true })

    // warframe group
    await Group.query().upsertGraph({
        id: 'g2',
        users: [
            { id: 'u1' }, { id: 'u2' },
            { id: 'u4' }, { id: 'u6' }
        ]
    }, { relate: true })

    // no mans sky group
    await Group.query().upsertGraph({
        id: 'g3',
        users: [
            { id: 'u1' }, { id: 'u4' }, { id: 'u5' },
            { id: 'u6' }, { id: 'u7' }
        ]
    }, { relate: true })

    // playstation platform
    await Platform.query().upsertGraph({
        id: 'PS',
        users: [
            { id: 'u1' }, { id: 'u3' },
            { id: 'u4' }, { id: 'u5' }, { id: 'u6' },
            { id: 'u7' }
        ]
    }, { relate: true })

    // Xbox platform
    await Platform.query().upsertGraph({
        id: 'XB',
        users: [{ id: 'u1' }, { id: 'u6' }, { id: 'u7' }]
    }, { relate: true })

    // PC platform
    await Platform.query().upsertGraph({
        id: 'PC',
        users: [{ id: 'u1' }, { id: 'u2' }, { id: 'u5' }]
    }, { relate: true })

    // destiny events

    await Event.query().insertGraph({
        name: 'Bad Taste',
        group_id: 'g1',
        platform_id: 'PS',
        max_participants: 4,
        participants: [ { id: 'u1' }, { id: 'u6' }, { id: 'u7' } ],
        alternatives: [ ],
        when: future(1)
    }, { relate: true })

    await Event.query().insertGraph({
        name: 'The Last Starfighter',
        group_id: 'g1',
        platform_id: 'PS',
        max_participants: 6,
        participants: [ { id: 'u1' }, { id: 'u2' }, { id: 'u5' } ],
        alternatives: [ ],
        when: future(3)
    }, { relate: true })

    await Event.query().insertGraph({
        name: 'Starship Troopers',
        group_id: 'g1',
        platform_id: 'XB',
        max_participants: 6,
        participants: [ { id: 'u1' }, { id: 'u6' }, { id: 'u7' } ],
        alternatives: [ ],
        when: future(8)
    }, { relate: true })

    // no man's sky events

    await Event.query().insertGraph({
        name: 'Baby Driver',
        group_id: 'g3',
        platform_id: 'PS',
        max_participants: 4,
        participants: [ { id: 'u7'} ],
        alternatives: [ ],
        when: future(1)
    }, { relate: true })

    await Event.query().insertGraph({
        name: 'Blues Brothers',
        group_id: 'g3',
        platform_id: 'PS',
        max_participants: 4,
        participants: [ { id: 'u7'} ],
        alternatives: [ ],
        when: future(4)
    }, { relate: true })

    // warframe events
    await Event.query().insertGraph({
        name: 'Ninja Turtles',
        group_id: 'g2',
        platform_id: 'PS',
        max_participants: 4,
        participants: [ { id: 'u6' }, { id: 'u1' }],
        alternatives: [ ],
        when: future(2)
    }, { relate: true })

    await Event.query().insertGraph({
        name: 'Crouching Tiger',
        group_id: 'g2',
        platform_id: 'PS',
        max_participants: 4,
        participants: [ { id: 'u6' }, { id: 'u1' }],
        alternatives: [ ],
        when: future(1)
    }, { relate: true })


    // tokens
    await Token.query().insert({ id: 't1', user_id: 'u1'})
    await Token.query().insert({ id: 't2', user_id: 'u2'})
    await Token.query().insert({ id: 't3', user_id: 'u3'})
    await Token.query().insert({ id: 't4', user_id: 'u4'})
    await Token.query().insert({ id: 't5', user_id: 'u5'})
    await Token.query().insert({ id: 't6', user_id: 'u6'})
    await Token.query().insert({ id: 't7', user_id: 'u7'})

}