'use strict'
/* global describe it  beforeEach afterEach */
/* eslint-disable no-unused-expressions */
const { expect } = require('chai')
const sinon = require('sinon')
const http = require('./support/http')
require('./support/logger')

const { HTTP_OK } = require('../app/util/const')
describe('events page', function() {

    const sandbox = sinon.createSandbox()
    beforeEach(async function() {
        await http.start()
    })

    afterEach(function() {
        sandbox.restore()
    })

    it('should return the events page', async function() {
        const req = http.request()
        const res = await req.get('/events/')
        expect(res.status).to.equal(HTTP_OK)

    })

})