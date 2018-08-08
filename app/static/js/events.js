'use strict'
/* global Vue io jstz */
/* eslint-disable no-console */

if(window.hasOwnProperty('Vue')) {


    Vue.component('alternative-item', {
        props: ['alternative', 'event'],
        template: '#alternative-item-template',
        computed: {
            canLeave: function() {
                return this.alternative.id === this.$root.token.user_id
            }
        },
        methods: {
            leave: function() {
                console.log('leaving: ' + this.event.id)
                this.$root.inProgress = true
                this.$root.io.emit('leave', { 
                    event_id: this.event.id, type: 'alternative' 
                })
            }
        }
        
    })

    Vue.component('participant-item', {
        props: ['participant', 'event'],
        template: '#participant-item-template',
        computed: {
            canLeave: function() {
                return this.participant.id === this.$root.token.user_id
            }
        },
        methods: {
            leave: function() {
                console.log('leaving: ' + this.event.id)
                this.$root.inProgress = true
                this.$root.io.emit('leave', { 
                    event_id: this.event.id, type: 'participant' 
                })
            }
        }
        
    })

    Vue.component('event-item', {
        props: ['event'],
        template: '#event-item-template',
        computed: {
            canJoinAsParticipant: function() {
                return (
                    this.event.participants.length < this.event.max_participants
                    && !this.event.joined
                )
            },
            canJoinAsAlternative: function() {
                return !this.event.joined
            }
        },
        methods: {
            toggleVisible: function() {
                this.event.visible = !this.event.visible
            },
            join: function(type) {
                console.log('join as ' + type)
                this.$root.inProgress = true
                this.$root.io.emit('join', { event_id: this.event.id, type})
            }
        }
    })

    Vue.component('group-item', {
        props: ['group'],
        template: '#group-item-template',
        data: function() {
            // eslint-disable-next-line prefer-destructuring
            var datePicker = this.$root.datePicker
            return {
                newEvent: false,
                event: {
                    name: '',
                    date: datePicker.dates[0].value,
                    hour: datePicker.now.hour,
                    group_id: this.group.id,
                    minutes: datePicker.now.minutes,
                    period: datePicker.now.period,
                    tz: datePicker.now.tz,
                    tzWarning: datePicker.now.tzWarning,
                    max_participants: 4,
                    platform_id: this.$root.platforms[0]
                },
                dates: datePicker.dates,
                hours: datePicker.hours,
                minutes: datePicker.minutes,
                platforms: this.$root.platforms,
                periods: [ 'AM', 'PM' ],
            }
        },
        methods: {
            toggleVisible: function() {
                this.group.visible = !this.group.visible
            },
            create: function() {
                console.log('creating new event ', this.event)
                this.$root.inProgress = true
                this.$root.io.emit('create', this.event)
                

            }
        }
    })

    window.app = new Vue({
        el: '#app',
        data: {
            token: {},
            inProgress: false,
            warning: {
                message: ''
            },
            error: {
                message: '',
                detail: '',
                detailVisible: false
            },
            groups: [],
            platforms: [],
            showPlatforms: false,
            datePicker: {}
        
        },
        methods: {
            mergeVisible: function(oldData, newData) {
                var that = this
                // merge the current and new visible states
                newData.forEach(function (n) {
                    for (var i=0; i < oldData.length; i++) {
                        if (oldData[i].id === n.id) {
                            // found it, set the visibility
                            n.visible = oldData[i].visible
                            // now merge the events if they exist
                            if(n.events) that.mergeVisible(oldData[i].events, n.events)
                            break // our work here is done
                        }
                    }
                })
              
            }
        },
        created: function() {

            this.inProgress = true

            var token = (function() {
                // get the session cookie
                // should already be URL safe
                var c = document.cookie.match(/8bn-team=([^;]+)/)
                if(c && c.length > 1) return c[1]
            })()

            var tz = encodeURI(jstz.determine().name())

            var that = this
            that.io = io('/events?token=' + token + '&tz=' + tz)

            that.io.on('connect', function() {
                console.log('socket.io connected')
                that.warning.message = ''
            })

            that.io.on('disconnect', function() {
                console.log('socket.io disconnected')
                that.warning.message = 'disconnected from server'
            })

            that.io.on('token', function(token) {
                that.token = token
            })

            that.io.on('events', function(data) {
                that.platforms = data.platforms
                that.datePicker = data.datePicker
                that.showPlatforms = data.platforms.length > 1

                that.mergeVisible(that.groups, data.groups)
                that.groups = data.groups
                

                that.inProgress = false
            })

        }
    })

}

