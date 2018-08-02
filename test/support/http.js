'use strict'

const app = require('../../app')
const axios = require('axios')

let http

async function start() {

    // start the http server once
    if(!http) {
        process.env.PORT = 1234
        process.env.HOST_URL = 'http://127.0.0.1:' + process.env.PORT
        http = await app.startHttpServer()
    }

}

function request(opts) {
    return axios.create(Object.assign({
        baseURL: process.env.HOST_URL,
        // have every response resolve a promise
        validateStatus: null,
        maxRedirects: 0
    }, opts))
}


module.exports = { start, request }