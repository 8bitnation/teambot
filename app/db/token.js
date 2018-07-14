'use strict'

const { urlSafeToken } = require('../util/token')
const { Model } = require('objection')

class Token extends Model {
    static get tableName() {
        return 'token'
    }

    async $beforeInsert(context) {
        await super.$beforeInsert(context)
        if(!this.id) this.id = await urlSafeToken()

    }

    static get relationMappings() {

        const User = require('./user')
        const Group = require('./group')

        return {
            user: {
                relation: Model.HasOneRelation,
                modelClass: User,
                join: {
                    from: 'token.user_id',
                    to: 'user.id'
                }
            },
            group: {
                relation: Model.HasOneRelation,
                modelClass: Group,
                join: {
                    from: 'token.group_id',
                    to: 'group.id'
                }
            },
        }
    }
}

module.exports = Token