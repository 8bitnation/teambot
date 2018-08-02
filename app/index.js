'use strict'

require('dotenv').config()
const logger = require('./util/logger')
const discord = require('./discord')
const db = require('./db')
const Koa = require('koa')
const http = require('http')
const { promisify } = require('util')

process.on('unhandledRejection', (reason) => { 
    throw reason 
})

async function startHttpServer() {
    logger.info('Starting HTTP service')
    if(!process.env.HOST_URL) throw new Error('process.env.HOST_URL is not set')

    const app = new Koa()
    app.use(require('./middleware/logger'))
    app.use(require('koa-static')('static'))
    const server = http.createServer(app.callback())
    const DEFAULT_PORT = 3000


    app.use(require('./routes/auth'))

    const listen = promisify(server.listen.bind(server))
    // eslint-disable-next-line eqeqeq, no-eq-null
    const port = process.env.PORT || DEFAULT_PORT
    await listen(port)
    logger.info('HTTP server listening on port: %s', port)
    return server
}

async function start() {
    try {
        
        logger.info('Initialising DB')
        await db().migrate.latest()
        logger.info('Logging into discord')
        await discord.login(process.env.DISCORD_TOKEN)
        logger.info('Starting HTTP service')
        await startHttpServer()

    } catch(err) {
        logger.error(err)
        process.exit(1)
    }

}

module.exports = { start, startHttpServer }

