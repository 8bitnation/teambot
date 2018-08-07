'use strict'

const { Model } = require('objection')

class User extends Model {
    static get tableName() {
        return 'user'
    }

    static get relationMappings() {

        const Group = require('./group')
        const Platform = require('./platform')

        return {
            groups: {
                relation: Model.ManyToManyRelation,
                modelClass: Group,
                join: {
                    from: 'user.id',
                    through: {
                        from: 'group_user.user_id',
                        to: 'group_user.group_id',
                    },
                    to: 'group.id'
                }
            },
            platforms: {
                relation: Model.ManyToManyRelation,
                modelClass: Platform,
                join: {
                    from: 'user.id',
                    through: {
                        from: 'platform_user.user_id',
                        to: 'platform_user.platform_id',
                    },
                    to: 'platform.id'
                }
            }
        }


    }
}

module.exports = User