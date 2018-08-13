// perhaps: https://github.com/typicode/lowdb

const TinyDB = require('tinydb');

const dbReady = async (DB) => new Promise(resolve => DB.onReady = resolve);

class TinyDBConnection {
    constructor(dbInstance) {
        this._db = dbInstance;
    }

    /**
     * Get number of records in the store
     */
    get size() {
        return this._db._data.data.length;
    }

    getFirst() {
        return this._db._data.data[0];
    }
    
    // NOTE: could be `query: object | id: number`
    // TODO: change to return an array of TinyDBRecord's or have two funcs, findOne, findAll?
    async find(query) {
        // find record
        return new Promise((resolve, reject) => {
            this._db.find(query, (error, data) => {
                if (error) {
                    console.error('DB COUND NOT RETRIEVE MESSAGE', error);
                    reject(error);
                }

                if (data.length !== 1) {
                    reject(new Error("UNEXPECTED NUMBER OF RECORDS FOUND: " + data.length));
                }

                resolve(new TinyDBRecord(this._db, data[0]));
            });
        });
    }

    // Test result: Appears functional
    async insert(data) {
        return new Promise((resolve, reject) => {
            this._db.appendItem(data, (error, record, recordIndex) => {
                if (error) {
                    reject(error);
                } else {
                    console.log(`Appended item. New item Index: ${recordIndex}.`);
                    resolve(new TinyDBRecord(this._db, record, recordIndex));
                }
            })
        });
    }
};

class TinyDBRecord {
    constructor(dbReference, recordReference, recordIndex) {
        this._db = dbReference;
        this._ref = recordReference;
        // not very useful, it's an array, if data is removed `recordIndex` is no longer valid...
        // could implement own map in the DB instance object to keep track of the records... 🤔
        this._recordIndex = recordIndex;
        this._isDeleted = false;
    }

    get data() {
        return this._ref;
    }
    
    /**
     * For updating the record data. Whole record at a time.
     * 
     * @param {object} newData 
     */
    async set(newData) {
        // this._db.update data
        // TODO: could potentially just find index of the reference object itself, but seems flaky (?)
        const DB_RECORD = this._db._data.data.find(record => record.id === this._ref.id);
        const DB_RECORD_INDEX = this._db._data.data.indexOf(DB_RECORD);
        this._db._data.data[DB_RECORD_INDEX] = newData;
        this._db._save(); // await?

        this._ref = newData;
    }

    // Test result: Appears functional
    async delete() {
        if (this._isDeleted) {
            throw(new Error('Record already deleted'));
        }

        return new Promise((resolve, reject) => {
            this._db.findByIdAndRemove(this._ref._id, (error, record, recordLastIndex) => {
                if (error) {
                    reject(error);
                } else {
                    console.log('removed record:', record, recordLastIndex);
                    // cleanup
                    this._isDeleted = true;
                    resolve(true);
                }
            })
        })
    }
}

// TODO: make adapter into just a DB setup function
const getDB = async (dbLocation = './local.db') => {
    // RENAME to async getDB?
    // returns DBInstance
    let DB;
    
    try {
        console.log('trying for DB');
        // TODO: extract config to local/prod etc
        DB = new TinyDB(dbLocation); // pass that from lambda context or something
        await dbReady(DB);
        console.log('GOT THE DB');
    } catch (e) {
        console.log("DB SETUP ERROR", e);
        throw new Error("DB SETUP ERROR", e);
        // callback(new Error("DB SETUP ERROR", e));
    }

    /*/
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
        throw new Error("DB setInfo error", error);
        // callback(new Error("DB setInfo error", error));
    }
    //*/

    console.log('DATABASE CREATED?:', DB.constructor.name);
    return new TinyDBConnection(DB);

    // NOTE: Firebase works based on getting a document based on some string identifier
    // and just insering into it.
    // How would this be resonably abstracted?
    //  inser(DB, object, identifier?)
    // insert(DB, object) {
    //     await DB.appendItem(object);
    // },

    // NOTE: could be `query: object | id: number`
    // async find(DB, query) {
    //     return new Promise((resolve, reject) => {
    //         DB.find(query, (error, data) => {
    //             if (error) {
    //                 console.error('DB COUND NOT RETRIEVE MESSAGE', error);
    //                 reject(error);
    //             }

    //             if (data.length !== 1) {
    //                 reject(new Error("UNEXPECTED NUMBER OF RECORDS FOUND: " + data.length));
    //             }

    //             resolve(data[0]);
    //         });
    //     });
    // },

    // TODO: NAH, I want to have something like an ORM (DB.find() -> record -> record.set()) ?
    // set(DB, id, newRecord) {
    //     // const DB_RECORD = DB._data.data.find(record => record.id === id);
    //     // const DB_RECORD_INDEX = DB._data.data.indexOf(DB_RECORD);
    //     // DB._data.data[DB_RECORD_INDEX] = newRecord;
    //     // DB._save(); // AWAIT?
    // },
    
    // delete() {
    //     // TODO
    // },
};

// TODO: hmm.......
async function getDBSync(...args) {
    const db = await getDB(...args);
    return db;
}

module.exports = { getDB };


// fundamentaly not sure how promisses work? lol
// so, in the getDB. When I'm new TinyDB(...) and await dbReady()... is that gonna execute in order before the function returns? I THINK SO!?!?