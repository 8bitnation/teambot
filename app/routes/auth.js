'use strict'

const logger = require('../util/logger')
const Router = require('koa-router')
const Token = require('../db/token')
const { HTTP_UNAUTHORIZED, COOKIE_NAME } = require('../util/const')

const router = new Router({ prefix: '/auth' })

router.get('/:token', async function(ctx) {
    // lookup the token
    logger.debug('%s retrieving token %s', ctx.id, ctx.params.token)

    const token = await Token.query().findById(ctx.params.token)

    if(!token) {
        ctx.status = HTTP_UNAUTHORIZED
        return
    }

    ctx.cookies.set(COOKIE_NAME, ctx.params.token)
    return ctx.redirect('/events')
})

module.exports = router.routes()
