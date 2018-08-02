'use strict'

const { Model } = require('objection')
const { User, Group, Event } = require('../../app/db')
// create some sample users and events for development purposes
// DO NOT RUN THIS ON A LIVE SYSTEM!

function future(hours) {
    const now = Date.now()

    const MS_IN_HOUR = 3600000
    const future = now + (hours * MS_IN_HOUR)

    return new Date(future).toISOString()

}

exports.seed = async function(knex) {

    Model.knex(knex)

    await User.query().insert({ id: '1', name: 'Retro'})
    await User.query().insert({ id: '2', name: 'BngPlz'})
    await User.query().insert({ id: '3', name: 'Zepto'})
    await User.query().insert({ id: '4', name: 'Zuel'})
    await User.query().insert({ id: '5', name: 'Uncle'})
    await User.query().insert({ id: '6', name: 'Geeky'})

    await Group.query().insert({ id: '1', name: 'destiny'})
    await Group.query().insert({ id: '2', name: 'warframe'})
    await Group.query().insert({ id: '3', name: 'no mans sky'})

    await Event.query().insertGraph({
        name: 'Baby Driver',
        group_id: '3',
        owner_id: '6',
        users: [ { id: '1' }, { id: '2'} , { id: '6' }],
        when: future(1)
    }, { relate: true })

    await Event.query().insertGraph({
        name: 'Ninja Turtles',
        group_id: '2',
        owner_id: '1',
        users: [ { id: '1' }, { id: '3'} , { id: '4' }],
        when: future(1)
    }, { relate: true })

}