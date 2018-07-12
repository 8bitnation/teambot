'use strict'

const {randomBytes} = require('crypto')

const DEFAULT_BITLEN = 48

function token(size) {
    return new Promise((resolve, reject) => {
        randomBytes(size || DEFAULT_BITLEN, (err, buf) => {
            if(err) reject(err)
            resolve(buf)
        })
    })
}

async function urlSafeToken(size) {
    
    const t = await token(size)
    return t.toString('base64').
        replace(/\+/g, '-').
        replace(/\//g, '_').
        replace(/=+$/, '')
}

module.exports = { token, urlSafeToken }

