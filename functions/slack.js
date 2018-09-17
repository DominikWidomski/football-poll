// this is kind useful maybe...
// https://medium.com/slack-developer-blog/out-and-back-again-6b2f3c84f484

console.log('[SLACK:] start');

// const TinyDB = require('tinydb');
const hash = require('../src/utils/hash');
// const firebase = require('./utils/DB/firebase');
// const getDB = firebase.getDB;
const mongodb = require('./utils/DB/mongodb');
const getDB = mongodb.getDB;

console.log('[SLACK:] after imports');

const clientFeatureWarning = "(upgrade your Slack client for better UX)";

process.on('unhandledRejection', error => {
    // Will print "unhandledRejection err is not defined"
    console.log('unhandledRejection', error.message);
    console.log(error);
});

const AUTH_TOKEN = "WPxNoxrvZYvE5T0B8xSFApNR"; // FIXME put in process ENV

// Incoming?
// token = Xue78utBH7gkrxbNUUswfHnM
// team_id = T0001
// team_domain = example
// channel_id = C2147483705
// channel_name = test
// user_id = U2147483697
// user_name = Steve
// command = /weather
// text = 94070
// response_url = https://hooks.slack.com/commands/1234/5678

const { URLSearchParams } = require('url');
const constructPoll = require('../src/constructPoll');

console.log('[SLACK:] before handler');

exports.handler = async function handler(event, context, callback) {
    console.log(">>> Inside Lambda", `[NODE_ENV: ${process.env.NODE_ENV}]`, `path: ${__dirname} - ${__filename}`);

    const query = new URLSearchParams(event.body);

    console.log(query);

    // TODO: AUTHENTICATE FIRST!
    if (query.get('token') !== AUTH_TOKEN) {
        callback(new Error('Unauthorized'));
        
        return;
    }
    
    let DB;
    try {
        DB = await getDB('./local.db');
        console.log("GOT THE DATABASE"); // DEBUG
    } catch (e) {
        console.log("Error getting DB"); // DEBUG
        callback(e);
    }
    /* RETRIEVING DB
    let DB;
    try {
        console.log('trying for DB');
        DB = new TinyDB('./local.db'); // pass that from lambda context or something
        await dbReady(DB);
        console.log('GOT THE DB');
    } catch (e) {
        console.log("DB SETUP ERROR", e);
        callback(new Error("DB SETUP ERROR", e));
    }
    
    try {
        await new Promise((resolve, reject) => {
            DB.setInfo('title', 'Test DB', function (err, key, value) {
                if (err) {
                    console.log("DB ERROR:", err);
                    reject(err);
                }
                
                console.log("DB:", `${key}: ${value}`);
                resolve();
            });
        });
    } catch (error) {
        console.log("DB setInfo error", error);
        callback(new Error("DB setInfo error", error));
    }
    //*/

    // TODO: Proper parameter parsing
    const message = query
        .get('text')
        .replace(/^"+?/, '')
        .replace(/"+?$/, '');
    
    const days = await constructPoll();
    //     const poll = await constructPoll({
    //     message
    // });

    const pollText = `POLL: ${message} ${days.map(day => `"${day}"`).join(' ')}`;
    // TODO: ensure it's unique (appending millis after a dot or whatever)
    const messageTimestamp = "" + (new Date()).getTime() / 1000;
    const id = hash(messageTimestamp);
    
    // LEFT HERE: PROBLEM: needs to have date to know which day to match with which icon.
    const fields = days.map(day => {
        return {
            "title": day,
            "value": "players: ...",
            "short": false
        };
    });

    const actions = days.map(day => {
        const option = day.split(' ')[0]; // TODO: Terrible
        const dayName = day.split(' ')[1];
        
        return {
            "name": option,
            "text": dayName,
            "type": "button",
            "value": `${id}@${option}`
        };
    });
    
    const slackMessage = {
        "text": pollText,
        "attachments": [
            {
                "fallback": `Football app poll. ${clientFeatureWarning}`,
                "color": "#5a6ebe",
                // "pretext": "Optional text that appears above the attachment block",
                // "author_name": "Dominik Widomski",
                // "author_link": "http://flickr.com/bobby/",
                // "author_icon": "http://flickr.com/icons/bobby.jpg",
                "title": "Football poll",
                // "title_link": "https://api.slack.com/",
                "text": message,
                // "image_url": "http://my-website.com/path/to/image.jpg",
                // "thumb_url": "http://example.com/path/to/thumb.png",
            },
            {
                "color": "#5a6ebe",
                fields,
            },
            {
                "fallback": `Would you like to join this game? ${clientFeatureWarning}`,
                "title": "Would you like to join this game?",
                "callback_id": "football_game_join",
                "color": "#3AA3E3",
                "attachment_type": "default",
                "actions": actions.slice(0, 5) // TODO: Something to split it by 5 into attachments confidently just in case
            },
            {
                "fallback": `Don't want to join this game. ${clientFeatureWarning}`,
                "color": "#3AA3E3",
                "callback_id": "football_game_reject",
                "actions": [
                    {
                        "name": "no",
                        "text": "No",
                        "type": "button",
                        "value": "no",
                        "style": "danger",
                    }
                ]
            },
            {
                "footer": "Football App",
                "footer_icon": "https://platform.slack-edge.com/img/default_application_icon.png",
                "color": "#5a6ebe",
                "ts": messageTimestamp
            }
        ]
    };

    /* INSERTING TO DB
    DB.appendItem({
        id,
        timestamp: messageTimestamp,
        query: query.toString(),
        slackChannelId: query.get('channel_id'),
        teamId: query.get('team_id'),
        slackMessage,
    });
    /*/
    // FIXME: UGH! adapter.setup should return instance of abstracted DBInterface
    if (DB) {
        DB.insert({
            id,
            timestamp: messageTimestamp,
            query: query.toString(),
            slackChannelId: query.get('channel_id'),
            teamId: query.get('team_id'),
            slackMessage,
        });
    }
    
    callback(null, {
        statusCode: 200,
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(slackMessage)
        // body: ''
    });
}