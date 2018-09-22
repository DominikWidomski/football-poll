const mongodb = require('./utils/DB/mongodb');
const getDB = mongodb.getDB;

async function main() {
    let DB;
    try {
        DB = await getDB('./local.db');
        console.log("GOT THE DATABASE"); // DEBUG
        // console.log(DB);
    } catch (e) {
        console.log("Error getting DB", e); // DEBUG
        // callback(e);
    }

    const query = {
        id: "MTE0NjI0MzYyNQ==",
        // timestamp: payload.message_ts.split('.')[0],
        slackChannelId: "D060PKVNK"
    };

    const res = await DB.find(query);

    console.log("FOUND:", res);
    
    process.exit();
}

main();