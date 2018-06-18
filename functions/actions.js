const AUTH_TOKEN = "WPxNoxrvZYvE5T0B8xSFApNR"; // FIXME put in process ENV

const chalk = require('chalk');

process.on('unhandledRejection', error => {
    // Will print "unhandledRejection err is not defined"
    console.log('unhandledRejection', error.message);
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
    }
}

// this is where button responses come back to
// https://www.netlify.com/docs/netlify-toml-reference/ Context for setting up and passing DB???
// https://www.netlify.com/docs/continuous-deployment/
exports.handler = async function handler(event, context, callback) {
    const body = new URLSearchParams(event.body);
    
    console.log(body);

    const payload = JSON.parse(body.get('payload'));

    if (payload.token !== AUTH_TOKEN) {
        callback(new Error('Unauthorized'));
        return;
    }

    let responseMessage = '';

    if (payload.type === "interactive_message") {
        const { actions, team, user } = payload;
        const { callback_id } = payload;

        if (actionHandlers[callback_id]) {
            actions.forEach(action => {
                responseMessage = actionHandlers[callback_id](action, team, user);
            });
        }
    }

    callback(null, {
        statusCode: 200,
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            "response_type": "ephemeral", // FIXME: Expecting a message only to the user but is replacing the original message...
            "text": responseMessage,
        })
    });
};