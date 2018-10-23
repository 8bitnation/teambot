'use strict'

const { Model } = require('objection')

class Platform extends Model {
    static get tableName() {
        return 'channel'
    }

    async $beforeUpdate(context) {
        await super.$beforeUpdate(context)
        this.updated_at = new Date().toISOString()
    }

    static get relationMappings() {
        const Group = require('./group')
        const Platform = require('./platform')

        return {
            group: {
                relation: Model.BelongsToOneRelation,
                modelClass: Group,
                join: {
                    from: 'channel.group_id',
                    to: 'group.id'
                }
            },
            platform: {
                relation: Model.BelongsToOneRelation,
                modelClass: Platform,
                join: {
                    from: 'channel.platform_id',
                    to: 'platform.id'
                }
            }
        }
    }
}

module.exports = Platform