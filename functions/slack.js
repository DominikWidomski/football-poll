const TinyDB = require('tinydb');
const DB = new TinyDB('./local.db'); // pass that from lambda context or something

process.on('unhandledRejection', error => {
    // Will print "unhandledRejection err is not defined"
    console.log('unhandledRejection', error.message);
    console.log(error);
});

const AUTH_TOKEN = "WPxNoxrvZYvE5T0B8xSFApNR"; // FIXME put in process ENV

// set info to DB
DB.setInfo('title', 'Test DB', function (err, key, value) {
    if (err) {
        console.log(err);
        return;
    }
});

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

exports.handler = async function handler(event, context, callback) {
    const query = new URLSearchParams(event.body);

    console.log(query);

    if (query.get('token') !== AUTH_TOKEN) {
        callback(new Error('Unauthorized'));
        return;
    }

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

    
    // LEFT HERE: PROBLEM: needs to have date to know which day to match with which icon.
    const fields = days.map(day => {
        return {
            "title": day,
            // "value": "{date}",
            "short": false
        };
        // maybe map field with action e.g.:

        // {
        //     fields: [{
        //         "title": "Monday {date} :icon:",
        //         // "value": "{date}",
        //         "short": false
        //     }]
        //     actions: [{
        //         "name": "{date}",
        //         "text": "date",
        //         "type": "button",
        //         "value": "{date}"
        //     }]
        // }
    });

    const actions = [
        ...(days.map(day => {
            const option = day.split(' ')[0];
            
            return {
                "name": option,
                "text": option,
                "type": "button",
                "value": option
            };
        })),
        {
            "name": "no",
            "text": "No",
            "type": "button",
            "value": "no"
        }
    ];
    
    
    const slackMessage = {
        "text": pollText,
        "attachments": [
            {
                "fallback": "Football app poll.",
                "color": "#5a6ebe",
                "pretext": "Optional text that appears above the attachment block",
                "author_name": "Dominik Widomski",
                // "author_link": "http://flickr.com/bobby/",
                // "author_icon": "http://flickr.com/icons/bobby.jpg",
                "title": "Football poll",
                // "title_link": "https://api.slack.com/",
                "text": message,
                // "image_url": "http://my-website.com/path/to/image.jpg",
                // "thumb_url": "http://example.com/path/to/thumb.png",
                "footer": "Football App",
                "footer_icon": "https://platform.slack-edge.com/img/default_application_icon.png",
                "ts": (new Date()).getTime()
            },
            {
                "color": "#5a6ebe",
                fields,
            },
            {
                "fallback": "Would you like to join this game?",
                "title": "Would you like to join this game?",
                "callback_id": "football_game_join",
                "color": "#3AA3E3",
                "attachment_type": "default",
                "actions": actions.slice(0, 5)
                // {
                //     "name": "yes",
                //     "text": "Yes",
                //     "type": "button",
                //     "value": "yes"
                // },
                // {
                //     "name": "no",
                //     "text": "No",
                //     "type": "button",
                //     "value": "no"
                // }
            },
            {
                "actions": actions.slice(5)
            }
        ]
    };

    // DB.insertItem(slackMessage, );
    
    callback(null, {
        statusCode: 200,
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(slackMessage)
    });
}