'use strict'

const logger = require('./util/logger')
const { User, Event, transaction } = require('./db')
const discord = require('./discord')
const moment = require('moment-timezone')
const { range, padStart } = require('lodash')

async function events(token) {

    logger.debug('getting events for %s', token.user_id)
    // get a list of events that are visible for the roken

    // first we get the roles the user has
    //const roles = await discord.roles(token.user_id)

    const puser = await User.query().eager('[platforms]').findById(token.user_id)
    if(!puser) return { error: 'user not found' }

    // make a list of the platform id's
    const platforms = puser.platforms.map( p => p.id)
    const guser = await puser.$query().eager('[groups, groups.events, groups.events.[participants, alternatives]]')
        .modifyEager('groups.events', qb => {
            qb.whereIn('platform_id', platforms)
        })

    const tz = guser.tz || token.tz || 'UTC'
    const tzWarning = !(guser.tz || token.tz)

    const groups = guser.groups.map( g => {
        return {
            visible: token.group_id === g.id,
            id: g.id,
            name: g.name,
            events: g.events.map( e => {
                const eventTime = moment(e.when).tz(tz)
                return {
                    visible: false,
                    id: e.id,
                    platform: e.platform_id,
                    date: eventTime.format('ddd, MMM Do, hh:mm A'),
                    timestamp: eventTime.valueOf(),
                    tz: eventTime.format('z'),
                    tzWarning,
                    name: e.name,
                    max_participants: e.max_participants,
                    joined: e.participants.concat(e.alternatives).find( p => p.id === token.user_id ),
                    participants: e.participants,
                    alternatives: e.alternatives
                }
            }).sort( (a, b) => a.timestamp - b.timestamp )
        }
    })

    const now = moment().tz(tz)
    const datePicker = {
        /* eslint-disable no-magic-numbers */
            
        now: {
            // get the closest 15 min period
            minutes: padStart((parseInt(now.minutes()/15, 10) * 15) % 60, 2, '0'),
            hour: now.hour() % 12 ? now.hour() % 12 : 12,
            period: now.format('A'),
            tz: now.format('z'),
            tzWarning
        },
        // determine the next 14 days from today in the locale
        // of the user
        dates: range(0, 14).map( (d) => ({
            value: now.add(d ? 1 : 0, 'd').format('YYYY-MM-DD'),
            text: now.format('ddd Do MMM YYYY')
        }) ),
        hours: range(1, 13),
        minutes: range(0, 60, 15).map( (m) => padStart(m, 2, '0'))
    }

    //await Event.query()
    return {
        datePicker,
        platforms,
        groups
    }
}

async function createEvent(token, e) {

    logger.debug('creating event %j %j', token, e)
    // creating an event does not require a transaction, however we still 
    // use one because the message update functions require it
    if(!e.when) {
        // assume this is from the UI

        const when = moment(
            e.date + padStart(e.hour, 2, '0') +
            e.minutes + e.period + e.tz,
            'YYYY-MM-DDhhmmAz'
        ).toISOString()

        e = {
            name: e.name,
            when,
            platform_id: e.platform_id,
            group_id: e.group_id,
            max_participants: e.max_participants
        }

    }

    const knex = Event.knex()
    await transaction(knex, async(trx) => {

        e.participants = [ { id: token.user_id } ]
        const event = await Event.query(trx).insertGraph(e, { relate: true })
        await discord.sendCreateMessage(trx, token, event)
    })

}

async function joinEvent(token, join) {

    logger.debug('joining event %j %j', token, join)
    const knex = Event.knex()
    await transaction(knex, async(trx) => {

        // get the current event

        const event = await Event.query(trx).eager('[participants, alternatives]').findById(join.event_id)

        // maybe the event was deleted?
        if(event) {
            const isParticipant = (join.type === 'participant' && event.participants.length < event.max_participants )
            const rq = isParticipant ? 'participants' : 'alternatives'
            await event.$relatedQuery(rq, trx).relate({ id: token.user_id })
            const update = await event.$query(trx).eager('[participants, alternatives]')
            await discord.sendJoinMessage(trx, token, update)
        }
    }) 
}

async function leaveEvent(token, leave) {

    logger.debug('leaving event %j %j', token, leave)
    const knex = Event.knex()
    await transaction(knex, async(trx) => {

        // get the current event

        const event = await Event.query(trx).eager('[participants, alternatives]').findById(leave.event_id)

        // maybe the event was deleted?
        if(event) {
            const del = await knex('event_' + leave.type).transacting(trx).del().where( { event_id: event.id, user_id: token.user_id})
            if(!del) return // nothing was done
            // to be safe, just go get the event again
            const update = await event.$query(trx).eager('[participants, alternatives]')
            if(update.participants.length) {
                await discord.sendLeaveMessage(trx, token, update)
            } else {
                // delete the event
                logger.debug('deleting event %j %j', token, leave)
                await Event.query(trx).deleteById(leave.event_id)
                await discord.sendDeleteMessage(trx, token, update)
            }
            
        }
    }) 
}

module.exports = {
    events, createEvent, joinEvent, leaveEvent
}