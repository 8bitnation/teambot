'use strict'

const { Event } = require('./db')
const discord = require('./discord')

async function events(token) {
    // get a list of events that are visible for the roken

    // first we get the roles the user has
    //const roles = await discord.roles(token.user_id)


    //await Event.query()
    return {}
}

async function addEvent() {

}

module.exports = {
    events, addEvent
}