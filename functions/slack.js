const AUTH_TOKEN= "Xue78utBH7gkrxbNUUswfHnM";

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
    }

    // TODO: Proper parameter parsing
    const message = query
        .get('text')
        .replace(/^"+?/, '')
        .replace(/"+?$/, '');
    
    const poll = await constructPoll();

    callback(null, {
        statusCode: 200,
        body: "Response Body agains"
    });
}