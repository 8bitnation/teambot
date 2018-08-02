'use strict'

const logger = require('../../app/util/logger')

function off() {
    logger.transports.forEach((t) => (t.silent = true))
}

function on() {
    logger.transports.forEach((t) => (t.silent = false))
}

// just turn it off for now
off()

module.exports = { off, on }