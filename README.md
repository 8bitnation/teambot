# teambot

8bit Nation event scheduling bot

This is still in [node.js](http://nodejs.org) as a stop-gap whilst I'm learning [go](http://golang.org)

# Installation

1. install node.js v8.11.0+

        $ wget https://nodejs.org/dist/v8.11.1/node-v8.11.1-linux-x64.tar.xz
        $ sudo tar -C /usr/local --strip-components 1 -xf node-v8.11.1-linux-x64.tar.xz 

2. git clone https://github.com/8bitnation/discord-danklebot.git
3. npm install
4. edit ecosystem.config.js as required

        HOST_URL = https://db9c92d4.ngrok.io
        DISCORD_TOKEN = <BOT/BUILD-AT-BOT/TOKEN>

5. start the bot via pm2 

        npm run pm2 start teambot

# discord

- Create a new app here: https://discordapp.com/developers/applications/
- Convert it to a bot account
- Get the client id and follow: https://discordapp.com/oauth2/authorize?scope=bot&client_id=CLIENT_ID
- Get your token from the bot account page

# updating the code from the repo

        npm run pm2 pull teambot

# Roles and Channel setup

The bot expects the guild/server to have channels in the following format:

    [name_of_game]_lfg

Any text channel with that format (i.e. the name ends with `_lfg`) will be considered
a possible group for management by the bot, IFF there is a corresponding role without the
`_lfg` postfix.  The role may have `_` or spaces to separate words in the name. 

Some examples:

| Channel               | Role              |
| --------------------- | ----------------- |
| destiny_lfg           | Destiny           |
| rainbox_six_siege_lfg | Rainbow Six Siege |
| no_mans_sky_lfg       | No Mans Sky       |


# accessing the bot service

Entering `/team` in a monitored channel will return a direct message from the bot to you with a link to the team bot web service.

The link will create a cookie called `8bn-team` with a token that will allow you to use the web service for up to 12 hours.  When the token expires, you should receive a warning with a message to re-issue the `/team` command and obtain a new token.

Upon opening the web service you will be presented with a list of groups associated with various games.  The list you see will depend upon which of roles you are currently ranked into on the 8bN discord guild.

## groups

Selecting a group will expand or collapse it, showing or hiding any scheduled events.  The number to the right of the group name indicates the number of scheduled events in the group.

If you issued the `/team` command in one of the `lfg` groups associated with the bot, when you first visit the bot service or refresh the page, that group should already be expanded showing any scheduled events for the group.

You can create new events by selecting the `create new event` item at the bottom of the group list.  **Note:** There is currently no option to edit events.  If you have made a mistake with an event and no-one else has yet joined it, you can remove it by simply leaving it.

## events

Selecting an event will expand or collapse it, showing or hiding the names of any participants or alternatives.  The numbers in the square brackets are in the following format:

`[ participants/max +alternatives ]`

If you have not already joined an event, you should see an item at the bottom of the participants and alternatives list that says `[ join ]`.  Select either one to join as a participant or an alternative.

If you have already joined the event, you should see `[ x ]` to the right of your name.  Select this to leave the event.

When the last participant leaves an event, the event will be removed, even if there are alternatives.

## timezones

The bot uses the timezone settings advertised by your browser to display any event times and dates in your local timezone.  It also uses your timezone settings to convert the time and date of any events you create from your local time.

Unfortunately, not all browsers report this correctly, so if you are not getting the right timezone, let a moderator know and we can override it for you.  We will need to know the closest city to you that has the same daylight saving rule. e.g. Europe/Amsterdam, America/Denver etc.


