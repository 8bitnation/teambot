'use strict'

require('dotenv').config()
const logger = require('./util/logger')
const Discord = require('discord.js')
const client = new Discord.Client()


client.on('ready', () => {
    logger.info(`Logged in as ${client.user.tag}!`)
    // check the guild channels

    for (let [k, v] of client.guilds.entries()) {
        logger.debug('%s = %s', k, v)
        for(let [k1, v1] of v.channels.entries()) {
            logger.debug('%s = %s / %s /%s ', k1, v1.type, v1.name, v1.topic)
        }
    }

})

// we have to be able to test this, so we explicitly define and export it
async function messageHandler(msg) {
    if(['/team', '!team'].some( cmd => msg.content.startsWith(cmd)) ) {
        // process the message
        logger.info('message received: %s %s', msg.id, msg.content)
        try {
            await msg.delete()

        } catch(err) {
            logger.error('failed to remove message: %s', msg.id)
        }
    } 
}

client.on('message', messageHandler)

function start() {
    client.login(process.env.DISCORD_TOKEN)
}

module.exports = { start, messageHandler }

