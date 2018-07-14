'use strict'

require('dotenv').config()
const logger = require('./util/logger')
const discord = require('./discord')
const db = require('./db')

process.on('unhandledRejection', (reason) => { 
    throw reason 
})

async function start() {
    try {
        if(!process.env.HOST_URL) throw new Error('process.env.HOST_ENV is not set')
    
        await db().migrate.latest()
        await discord.login(process.env.DISCORD_TOKEN)
    } catch(err) {
        logger.error(err)
        process.exit(1)
    }

}

module.exports = { start }

