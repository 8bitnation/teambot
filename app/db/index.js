'use strict'
const { Model, transaction } = require('objection')

const config = require('./config')
const Knex = require('knex')

let knex

module.exports = function(c) {
    // we cache an instance of knex, this allows us to get the cached version
    // but also allows us to override the config for testing 
    if(!knex) {
        knex = Knex(c || config)
        Model.knex(knex)
    }
    return knex
}

module.exports.Token = require('./token')
module.exports.User = require('./user')
module.exports.Group = require('./group')
module.exports.Event = require('./event')
module.exports.Platform = require('./platform')
module.exports.transaction = transaction