const AUTH_TOKEN = "WPxNoxrvZYvE5T0B8xSFApNR"; // FIXME put in process ENV

const chalk = require('chalk');
const TinyDB = require('tinydb');
const DB = new TinyDB('./local.db'); // pass that from lambda context or something

const dbReady = async (DB) => new Promise(resolve => DB.onReady = resolve);

process.on('unhandledRejection', error => {
    // Will print "unhandledRejection err is not defined"
    console.error('!!! unhandledRejection', error.message);
    console.log(error);
});

// https://api.slack.com/interactive-messages
// https://api.slack.com/docs/message-buttons
// https://api.slack.com/best-practices/storyboarding
// https://api.slack.com/best-practices/citizenship

const actionHandlers = {
    football_game_join: ({name, type, value}, team, user) => {
        if (type === "button" && value === "no") {
            console.info(chalk.blue(`>>> ${team.domain}:${user.name} does not want to join the game.`));
            
            return "Fine, maybe next time :simple_smile:";
        } else {
            console.info(chalk.blue(`>>> ${team.domain}:${user.name} wants to join the game on ${value}.`));
            
            return "You have been added to the game :thumbsup:";
        }
    },
    football_game_reject: ({ name, type, value }, team, user) => {
        if (type === "button" && value === "no") {
            console.info(chalk.blue(`>>> ${team.domain}:${user.name} does not want to join the game.`));

            return "Fine, maybe next time :simple_smile:";
        } else {
            console.info(chalk.blue(`>>> [football_game_reject] ${team.domain}:${user.name} unknown value sent: ${value}`));

            return "Unknown action";
        }
    }
}

// this is where button responses come back to
// https://www.netlify.com/docs/netlify-toml-reference/ Context for setting up and passing DB???
// https://www.netlify.com/docs/continuous-deployment/
exports.handler = async function handler(event, context, callback) {
    try {
        await dbReady(DB);
    } catch (e) {
        console.error("DB SETUP ERROR", e);
    }
    
    const body = new URLSearchParams(event.body);
    
    console.log(body);

    const payload = JSON.parse(body.get('payload'));

    if (payload.token !== AUTH_TOKEN) {
        callback(new Error('Unauthorized'));
        return;
    }

    // console.log("MESSAGE TS:", payload.message_ts.split('.')[0], "??? 1529653179");
    console.log('ID', payload.actions[0].value.split('@')[0]);
    const savedMessage = await new Promise((resolve, reject) => {
        DB.find({
            id: payload.actions[0].value.split('@')[0],
            // timestamp: payload.message_ts.split('.')[0],
            slackChannelId: payload.channel.id
        }, (error, data) => {
            if (error) {
                console.error('DB COUND NOT RETRIEVE MESSAGE', error);
                reject(error);
            }

            if (data.length !== 1) {
                reject(new Error("UNEXPECTED NUMBER OF RECORDS FOUND: " + data.length));
            }
            
            resolve(data[0]);
        });
    });

    console.log("SAVED MESSAGE", savedMessage);

    let responseMessage = '';
    const id = payload.actions[0].value.split('@')[0];

    if (payload.type === "interactive_message") {
        const { actions, team, user } = payload;
        const { callback_id } = payload;

        if (actionHandlers[callback_id]) {
            actions.forEach(action => {
                const actionValue = action.value.split('@')[1];
                responseMessage = actionHandlers[callback_id]({
                    ...action,
                    value: actionValue
                }, team, user);

                // Lazy populated players storage, could be eagerly created when message is saved in DB
                savedMessage.players = savedMessage.players || {};
                savedMessage.players[actionValue] = savedMessage.players[actionValue] || [];
                
                if (!savedMessage.players[actionValue].includes(user.name)) {
                    savedMessage.players[actionValue].push(user.name);
                } else {
                    const index = savedMessage.players[actionValue].indexOf(user.name);
                    savedMessage.players[actionValue].splice(index, 1);
                }
                
                // const updatedAction = savedMessage.slackMessage.attachments[2].actions.find(({value}) => value === action.value);
                // const actionIndex = savedMessage.slackMessage.attachments[2].actions.indexOf(updatedAction);
                // updatedAction
                // savedMessage.slackMessage.attachments[2].actions[actionIndex] = '';
            });
        }
    }
    
    // Update slack message
    const { fields } = savedMessage.slackMessage.attachments[1];
    savedMessage.slackMessage.attachments[1].fields = fields.map(field => {
        const day = field.title.split(' ')[0]; // Icon, e.g.: ":one:"

        return {
            ...field,
            value: `players: ${(savedMessage.players[day] || []).join(' ')}`
        };
    });

    // TODO: This is bullshit TinyDB is not finished
    const DB_RECORD = DB._data.data.find(record => record.id === id);
    const DB_RECORD_INDEX = DB._data.data.indexOf(DB_RECORD);
    DB._data.data[DB_RECORD_INDEX] = savedMessage;
    DB._save();
    // DB.insertItem(savedMessage, savedMessage._id, (error, content) => {
    //     if (error) {
    //         console.error("Error inserting data");
    //         throw new Error(error);
    //     } else {
    //         console.log('inserted this data:', content);
    //     }
    // });

    callback(null, {
        statusCode: 200,
        headers: {
            'Content-Type': 'application/json'
        },
        // body: JSON.stringify({
        //     "response_type": "ephemeral", // FIXME: Expecting a message only to the user but is replacing the original message...
        //     "text": '',
        body: JSON.stringify(savedMessage.slackMessage)
        // })
        // body: ''
    });
};