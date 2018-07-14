'use strict'
const { Model } = require('objection')

const config = require('./config')
const Knex = require('knex')

let knex

module.exports = function(c) {
    if(!knex) {
        knex = Knex(c || config)
        Model.knex(knex)
    }
    return knex
}