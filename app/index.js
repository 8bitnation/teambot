'use strict'

require('dotenv').config()
const logger = require('./util/logger')
const Discord = require('discord.js')
const client = new Discord.Client()

const db = require('./db')
const Token = require('./db/token')
const User = require('./db/user')
const Group = require('./db/group')

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

        // ignore anything not from a guild
        if(!msg.member || !msg.channel) return

        try {
            // create a token
            const user = await User.query().upsertGraph({
                id: msg.author.id,
                name: msg.member.nickname || msg.author.username
            }, { insertMissing: true })
            const group = await Group.query().upsertGraph({
                id: msg.channel.id,
                name: msg.channel.name
            }, { insertMissing: true })
            const token = await Token.query().insert({
                user_id: user.id,
                group_id: group.id
            })

            await msg.author.send('Please click on the following link to use the team tool: ' + 
                process.env.HOST_URL + '/auth/' + token.id )
        } catch(err) {
            logger.error('something went wrong when dealing with message: %s', msg.id, err)
        }   

    } 
}

client.on('message', messageHandler)

async function start() {
    if(!process.env.HOST_URL) {
        logger.error('process.env.HOST_ENV is not set')
        process.exit(1)
    }

    await db().migrate.latest()
    client.login(process.env.DISCORD_TOKEN)
}

module.exports = { start, messageHandler }

