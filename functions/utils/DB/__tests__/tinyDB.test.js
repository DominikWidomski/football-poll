const fs = require('fs');
const { getDB, getDBSyns } = require('../tinyDB');

const dbLocation = './test.db';

function deleteDatabaseIfExists(dbLoc) {
    try {
        if (fs.statSync(dbLoc).isFile()) {
            console.log('removing existing database file');
            fs.unlinkSync(dbLoc);
        }
    } catch (e) {
        console.log("ERROR", e);
    }
}

async function insertRecordTest() {
    deleteDatabaseIfExists(dbLocation);

    const db = await getDB(dbLocation);

    const record = await db.insert({ name: 'test' });

    console.log("RECORD", record);
    console.log("Amount of records:", db.size);
}

async function deleteRecordTest() {
    deleteDatabaseIfExists(dbLocation);

    const db = await getDB(dbLocation);

    const record1 = await db.insert({ name: 'test1' });
    const record2 = await db.insert({ name: 'test2' });

    // console.log("RECORD", record);
    console.log("Amount of records:", db.size);

    await record2.delete();
    await record1.delete();

    console.log("Amount of records:", db.size);
}

const main = async () => {
    await insertRecordTest();
    await deleteRecordTest();

    process.exit();
}

main();