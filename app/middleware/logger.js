'use strict'

const logger = require('../util/logger')

let requestCount = 0

module.exports = async (ctx, next) => {
    const start = Date.now()

    ctx.id = requestCount += 1
    logger.info(`req.${ctx.id}/HTTP ${ctx.method} ${ctx.url}`)
    await next()
    const ms = Date.now() - start
    logger.info(`res.${ctx.id}/HTTP ${ctx.method} ${ctx.url} ${ctx.status} - ${ms}`)
}