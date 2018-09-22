// http://mongodb.github.io/node-mongodb-native/3.1/quick-start/quick-start/

// Object to capture process exits and call app specific cleanup function

const os = require('os');

function noOp() { };

// TODO: setup proper event emitter to remove the listener as the process might still be running in memory
function cleanup(callback) {

    // attach user callback to the process event emitter
    // if no callback, it will still exit gracefully on Ctrl-C
    callback = callback || noOp;
    process.on('cleanup', callback);

    // do app specific cleaning before exiting
    process.on('exit', function () {
        process.emit('cleanup');
    });

    // catch ctrl+c event and exit normally
    process.on('SIGINT', function () {
        console.log('Ctrl-C...');
        process.exit(2);
    });

    //catch uncaught exceptions, trace, then exit normally
    process.on('uncaughtException', function (e) {
        console.log('Uncaught Exception...');
        console.log(e.stack);
        process.exit(99);
    });
};

var MongoClient = require('mongodb').MongoClient;

const auth = {
    username: "testUser",
    password: "kD0fq4skelCdBrWI"
};

const shards = [
    "doms-slack-shard-00-00-73uuh.mongodb.net:27017",
    "doms-slack-shard-00-01-73uuh.mongodb.net:27017",
    "doms-slack-shard-00-02-73uuh.mongodb.net:27017"
];
const options = [
    "replicaSet=doms-slack-shard-0",
    "authMechanism=SCRAM-SHA-1",
    "ssl=true",
    "authSource=admin"
];

const config = {
    db: "slackIntegration",
    collection: "messages"
};

class MongoDBConnection {
    constructor(clientInstance) {
        this._client = clientInstance;
    }

    get size() {
        return 0;
    }

    getFirst() {
        return 0;
    }

    async find(query) {
        // TODO: query likely needs to be transformed into MongoDB specific fields etc
        // After a second thought... not really. There's a specific `id` field in the saved message
        // need to rename that to something specific like `integrationMessageId`, but can use that
        const collection = this._client.db(config.db).collection(config.collection);
        
        const result = await new Promise((resolve, reject) => {

            collection.find(query).toArray(function (error, docs) {
                if (error) {
                    reject(new Error(error));
                    return;
                }

                console.log("THIS IS THE RESULT", error, docs);
                resolve(docs);
                return;
                
                // assert.equal(err, null);
                // console.log("Found the following records");
                // console.log(docs)
                // callback(docs);
                
            });

            // reject(new Error('Something wrong with querying DB'));
        });

        if (result.length) {
            return result.map(record => new MongoDBRecord(this._client, record));
        }
        
        return [];
    }

    async insert(data) {
        const collection = this._client.db(config.db).collection(config.collection);

        const result = await new Promise((resolve, reject) => {
            const location = os && os.hostname ? os.hostname() : "unknown";

            collection.insertOne({...data, location}, (error, result) => {
                if (error) {
                    reject(new Error(error));
                    return;
                }

                resolve(result.ops);
            });
        });

        return new MongoDBRecord(this._client, result);
    }
}

class MongoDBRecord {
    constructor(clientReference, data) {
        this._client = clientReference;
        this._data = data;
    }

    get data() {
        return this._data;
    }

    async set(newData) {
        const collection = this._client.db(config.db).collection(config.collection);

        collection.updateOne({ _id: this._dat._id}, {$set: newData}, (error, result) => {
            if (error) {
                throw new Error(error);
            }
        });
    }

    async delete() {
        const collection = this._client.db(config.db).collection(config.collection);

        collection.deleteOne({_id: this._data._id}, (error, result) => {
            if (error) {
                throw new Error(error);
            }
        })
    }
}

const getDB = async (dbLocation) => {
    console.log("[MONGODB]: getDB");
    // const uri = `mongodb://testUser:kD0fq4skelCdBrWI@${shards.join(',')}/doms-slack?${options.join('&')}`;
    const uri = `mongodb://${auth.username}:${auth.password}@${shards.join(',')}/doms-slack?${options.join('&')}`;
    // const uri = "mongodb://localhost:27017";
    let _client;

    await new Promise((resolve, reject) => {
        MongoClient.connect(uri, async function (error, client) {
            if (error) {
                console.log("[MONGODB]: ERROR", error);
                // throw new Error(error);
                reject(new Error(error));
                return;
            }
            // perform actions on the collection object
            // const collection = client.db(config.db).collection(config.collection);

            // const results = await new Promise((resolve, reject) => {
            //     const location = os && os.hostname ? os.hostname() : "unknown";

            //     collection.insertMany([
            //         { a: 1, location }, { a: 2, location }
            //     ], (error, result) => {
            //         if (error) {
            //             reject(new Error(error));
            //             return;
            //         }

            //         resolve(result.ops);
            //     });
            // });

            // console.log('[MONGODB]: inserted:', JSON.stringify(results, null, 2, 2));
            
            // console.log("[MONGODB]: ", collection);
            
            // console.log("[MONGODB]: CLIENT", client);
            console.log("[MONGODB]: got client");

            cleanup(() => {
                client.close();
                console.log("[MONGODB]: client closed");
            });

            _client = client;
            resolve(client);
        });
    });

    return new MongoDBConnection(_client);
}

module.exports = { getDB };