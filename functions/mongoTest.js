const mongodb = require('./utils/DB/mongodb');
const getDB = mongodb.getDB;

async function main() {
    let DB;
    try {
        DB = await getDB('./local.db');
        console.log("GOT THE DATABASE"); // DEBUG
        // console.log(DB);
        process.exit();
    } catch (e) {
        console.log("Error getting DB", e); // DEBUG
        // callback(e);
    }
}

main();