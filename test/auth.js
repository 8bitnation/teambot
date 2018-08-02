'use strict'
/* global describe it  beforeEach afterEach */
/* eslint-disable no-unused-expressions */
const { expect } = require('chai')
const sinon = require('sinon')
const db = require('./support/db')
const http = require('./support/http')
require('./support/logger')

const { HTTP_UNAUTHORIZED, HTTP_NOT_FOUND, HTTP_REDIRECT } = require('../app/util/const')
describe('auth', function() {

    const sandbox = sinon.createSandbox()
    beforeEach(async function() {
        await db.init()
        await http.start()
    })

    afterEach(function() {
        sandbox.restore()
    })

    it('should return HTTP NOT FOUND', async function() {
        const auth = http.request()
        const res = await auth.get('/auth')
        expect(res.status).to.equal(HTTP_NOT_FOUND)

    })

    it('return HTTP UNAUTHORIZED', async function() {
        const auth = http.request()
        const res = await auth.get('/auth/INVALIDTOKEN')
        expect(res.status).to.equal(HTTP_UNAUTHORIZED)
    })

    it('should redirect to the events page', async function() {
        // create a token
        const token = await db.createToken()
        const auth = http.request()
        const res = await auth.get('/auth/' + token.id)
        expect(res.status).to.equal(HTTP_REDIRECT)
        expect(res.headers.location).to.equal('/events')
    })

    it('should return a cookie with the token', async function() {
        // create a token
        const token = await db.createToken()
        const auth = http.request()
        const res = await auth.get('/auth/' + token.id)
        expect(res.status).to.equal(HTTP_REDIRECT)
        expect(res.headers['set-cookie']).to.have.length(1) // only one cookie
        expect(res.headers['set-cookie'][0]).to.contain(token.id)
    })

})