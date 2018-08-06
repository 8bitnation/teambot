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

        e.users = [ { id: token.user_id } ]
        const event = await Event.query(trx).insertGraph(e, { relate: true })
        await discord.sendCreateMessage(trx, event)
    })

}

async function joinEvent() {

}

async function leaveEvent() {

}

module.exports = {
    events, createEvent, joinEvent, leaveEvent
}