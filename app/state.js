'use strict'

const logger = require('./util/logger')
const { User, Event, Group, transaction } = require('./db')
const discord = require('./discord')
const moment = require('moment-timezone')
const { range, padStart } = require('lodash')

async function events(token) {

    logger.debug('getting events for token: %j', token)
    // get a list of events that are visible for the token

    // first we get the roles the user has
    //const roles = await discord.roles(token.user_id)

    const puser = await User.query().eager('[platforms]').findById(token.user_id)
    if(!puser) return { error: 'user not found' }

    // make a list of the platform id's
    const platforms = puser.platforms.map( p => p.id)
    // don't display anything that was going to start more than 1 hour ago
    const cutoff = moment().subtract(1, 'hour').toISOString()
    const guser = await puser.$query().eager('[groups, groups.events, groups.events.[participants, alternatives]]')
        .modifyEager('groups.events', qb => {
            qb.whereIn('platform_id', platforms).andWhere('when', '>', cutoff)
        })

    const tz = token.user.tz || token.tz || 'UTC'
    const tzWarning = !(token.user.tz || token.tz)

    const groups = guser.groups.map( g => {
        return {
            visible: token.group_id === g.id,
            id: g.id,
            name: g.name,
            events: g.events.map( e => {
                const eventTime = moment(e.when).tz(tz)
                const tza = (tz) => moment(e.when).tz(tz).format('z')
                e.participants.forEach( p => { if(p.tz) p.tza = tza(p.tz) })
                e.alternatives.forEach( a => { if(a.tz) a.tza = tza(a.tz) } )
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
    }).sort(( a, b) => a.name.localeCompare(b.name) )

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
        // determine the next 21 days from today in the locale
        // of the user
        dates: range(0, 21).map( (d) => ({
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

        // figure out the timezone
        const tz = token.user.tz || token.tz || 'UTC'

        const when = moment.tz(
            e.date + padStart(e.hour, 2, '0') + e.minutes + e.period,
            'YYYY-MM-DDhhmmA', 
            tz
        ).toISOString()

        e = {
            name: e.name,
            when,
            platform_id: e.platform_id,
            group_id: e.group_id,
            max_participants: e.max_participants
        }
    }

    // determine the channel
    const group = await Group.query().eager('[channels]').findById(e.group_id)
    const platformChannel = group.channels.find(c => c.platform_id === e.platform_id)
    if(platformChannel) {
        e.channel_id = platformChannel.id
    } else {
        // get the generic channel
        const genericChannel = group.channels.find(c => c.platform_id === null)
        e.channel_id = genericChannel.id
    }

    const knex = Event.knex()
    await transaction(knex, async(trx) => {

        e.participants = [ { id: token.user_id } ]
        const event = await Event.query(trx).insertGraph(e, { relate: true })
        const update = await event.$query(trx).eager('[platform, participants, alternatives]')
        await discord.sendCreateMessage(trx, token, update)
    })

}

async function joinEvent(token, join) {

    logger.debug('joining event %j %j', token, join)
    const knex = Event.knex()
    await transaction(knex, async(trx) => {

        // get the current event

        const event = await Event.query(trx).eager('[platform, participants, alternatives]').findById(join.event_id)

        // maybe the event was deleted?
        if(event) {
            const isParticipant = (join.type === 'participant' && event.participants.length < event.max_participants )
            const rq = isParticipant ? 'participants' : 'alternatives'
            await event.$relatedQuery(rq, trx).relate({ id: token.user_id })
            const update = await event.$query(trx).eager('[platform, participants, alternatives]')
            await discord.sendJoinMessage(trx, token, update)
        }
    }) 
}

async function leaveEvent(token, leave) {

    logger.debug('leaving event %j %j', token, leave)
    const knex = Event.knex()
    await transaction(knex, async(trx) => {

        // get the current event

        const event = await Event.query(trx).eager('[platform, participants, alternatives]').findById(leave.event_id)

        // maybe the event was deleted?
        if(event) {
            const del = await knex('event_' + leave.type).transacting(trx).del().where( { event_id: event.id, user_id: token.user_id})
            if(!del) return // nothing was done
            // to be safe, just go get the event again
            const update = await event.$query(trx).eager('[platform, participants, alternatives]')
            if(update.participants.length) {
                await discord.sendLeaveMessage(trx, token, update)
            } else {
                // delete the event
                logger.debug('deleting event %j %j', token, update)
                // first clear out any alternatives
                if(update.alternatives.length) {
                    await knex('event_alternative').transacting(trx).del().where( { event_id: event.id })
                }
                await update.$query(trx).delete()
                await discord.sendDeleteMessage(trx, token, update)
            }
            
        }
    }) 
}

module.exports = {
    events, createEvent, joinEvent, leaveEvent
}