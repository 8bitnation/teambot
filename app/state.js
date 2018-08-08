'use strict'

const { User, Event, transaction } = require('./db')
const discord = require('./discord')

async function events(token) {
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

    //await Event.query()
    return guser
}

async function createEvent(token, e) {

    // creating an event does not require a transaction, however we still 
    // use one because the message update functions require it

    const knex = Event.knex()
    await transaction(knex, async(trx) => {

        e.participants = [ { id: token.user_id } ]
        const event = await Event.query(trx).insertGraph(e, { relate: true })
        await discord.sendCreateMessage(trx, event)
    })

}

async function joinEvent(token, join) {

    const knex = Event.knex()
    await transaction(knex, async(trx) => {

        // get the current event

        const event = await Event.query(trx).eager('[participants, alternatives]').findById(join.event_id)

        // maybe the event was deleted?
        if(event) {
            const isParticipant = (join.type === 'participant' && event.participants.length < event.max_participants )
            const rq = isParticipant ? 'participants' : 'alternatives'
            await event.$relatedQuery(rq, trx).relate({ id: token.user_id })
            await discord.sendJoinMessage(trx, event)
        }
    }) 
}

async function leaveEvent(token, leave) {
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
                await discord.sendLeaveMessage(trx, event)
            } else {
                // delete the event
                await Event.query(trx).deleteById(leave.event_id)
                await discord.sendDeleteMessage(trx, event)
            }
            
        }
    }) 
}

module.exports = {
    events, createEvent, joinEvent, leaveEvent
}