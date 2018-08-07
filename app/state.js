'use strict'

const { Event, transaction } = require('./db')
const discord = require('./discord')

async function events(token) {
    // get a list of events that are visible for the roken

    // first we get the roles the user has
    //const roles = await discord.roles(token.user_id)


    //await Event.query()
    return {}
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

async function leaveEvent() {

}

module.exports = {
    events, createEvent, joinEvent, leaveEvent
}