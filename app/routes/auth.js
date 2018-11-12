'use strict'

const logger = require('../util/logger')
const Router = require('koa-router')
const { COOKIE_NAME } = require('../util/const')

const router = new Router({ prefix: '/auth' })

router.get('/:token', function(ctx) {
    logger.debug('%s auth redirect for token %s', ctx.id, ctx.params.token)
    // pass though token lookup until later
    // just set the cookie
    ctx.cookies.set(COOKIE_NAME, ctx.params.token, { httpOnly: false })
    return ctx.redirect('/events')
})

module.exports = router.routes()
