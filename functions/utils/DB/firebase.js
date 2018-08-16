// RELEVANT: https://firebase.google.com/docs/firestore/quickstart
console.log('[FIREBASE:] First line in file');

const admin = require('firebase-admin');
// const firebase = require("firebase");  // TIMESOUT
// Required for side-effects
// require("firebase/firestore");  // TIMESOUT
// const serviceAccountJSON = require('../../../doms-slack-786b1bf42868.json');
const serviceAccountJSON = { // TODO: revert this shit
    "type": "service_account",
    "project_id": "doms-slack",
    "private_key_id": "786b1bf4286851191b811973d7247b89c7ea3e75",
    "private_key": "-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQCfwcg3l9vhEhJV\nYZebJ3xXy/OC3EWlf4vWUqJCCkEZFHgLP0K3uSFekWQPJ90ijZDuWzNqBKBnUD4e\naOtE/lhEE89d44U/tAwDjSkBZnpqD4ckoRyNwSF0z+inyFw1KjlyYNje7YbccGIi\nhpeUG8gGhDp85tlH2pgmCpgDEnwmg0A/Ld45/GXHtgChUgepx1ys8GutgZzXR8R3\n8HQrjpshv6ELQY8SsV+i4kLAZrsJMpKa7K8yZru8iKBaCsv3InB5eO9K3cLo7nm4\nWY/NMM6KgxgtskLLEahvDtNYnsviCnx8YeWvai9ah5BLXb52u1HDj5sM98Xud4V+\nURlcLfQxAgMBAAECggEAELZtA6PXVMxXLqdu/MQ8tdKYPvBcONwG/PzYDKCV/tGt\nXT/Y8u9jFkmPdiZtc9freYQA9O5W+Xfjh7riIe2ZvkV0RBYxMmDbgOObjpHx7HaD\nZMmV+x5hKZ82b5b+TnGEYPrQtUGUAiufmI0L/mqJmmTq2XYs9N9hW1lwXaHpav3V\nwlfBRXjTOGpmwB4eXQ6V0p6KyFGVIrqYJwQbO5sYyrXuyZ89jZM99jScmUYD/s/v\npgt4vF19a1A+MOOSDFPXTjtKhXeVLdQBkbeLg5eI6e2bwTr6TP9x2z/OdvaPD9LP\nUiQPYqiDVjKv7XMnP/Ya+sDsg1vvaloCsk0J1LhGIQKBgQDL7u5ZElQtns//X+aP\n08ToqrisRd4K6BoHLiyOOOx1DIy9GYxqrX1mSsAXF5QL+4/nmvrA7GTqLpEGWNyN\nI10HPYGOD+9IMlRl8gAFeI4mmIsTuSz31Tdc2GvnLqWmNgT3n8zpevabCCDcvD3r\n++wIJQaz/z714kxBmlWaD0oMnwKBgQDIi3yfPy1rypfFt4eaqs9D3s5l1RraXITb\nZfv5E434dgfRvTUGC47zUN5B1+wtOuS95PGtdUVDCWykatxJlbeI0h+trF2AyMeB\nMKa2bGs5qgiIh/wM1AhXI0UPwdUTgrqSt2o2NCgUOHyT49hA43WQFZOvCKCDV2Ru\nJbW99xR9LwKBgQCpnsvkjhgx8bvzHuL4kh1foFAGCf7Ld43elws8KCCUoqGUz2E5\ngZ+hq17mVhgvd0eUThVuzbCKD71UWCjpw5Ym5YOSk7JkjGgiewyFgGZLt+lFuGms\noU1xDhmBqgzhmGC9Tc70C/B9tl8O+gtO8rS5eYJ/yDen8FeY4TN99mWS5QKBgF+A\nFVuccVvYgUgVaw0bdFJEwxM5VW1RC6+TNFfbmQsN4hFeQebcEDoMc5r1YTH0zsMj\nSHeq1c3jqgnuHXMpSdps/crtvyU598+sxGcw4Cr4rtGduEi/nC0qzZOAYaDF62U8\n1OZ1FfTzJVgj83KLHwv7SnXa7N0++8N8T7zj8azfAoGAOBs8H9JkLNARgu+5KIHt\nAHE+3yGY9lR2xk4Qd32MtObf+00kP5EYd/3ZbhbSTK66/bM+mjBxxmnx6HXNNKp5\nHU7p08LJGqGyf4C82vXc3RegrNtHhhNt8UpiUTclQ6BS9sesxrUAGy3322w/SXdZ\n2jyIb7LsTi73IM8qDGj/OVc=\n-----END PRIVATE KEY-----\n",
    "client_email": "doms-slack@appspot.gserviceaccount.com",
    "client_id": "113935636658905511774",
    "auth_uri": "https://accounts.google.com/o/oauth2/auth",
    "token_uri": "https://accounts.google.com/o/oauth2/token",
    "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
    "client_x509_cert_url": "https://www.googleapis.com/robot/v1/metadata/x509/doms-slack%40appspot.gserviceaccount.com"
};

console.log("[FIREBASE:] start import");
console.log("[FIREBASE:] account", serviceAccountJSON);

const collectionId = 'slack/poll/messages/';

class FirestoreConnection {
    constructor(dbInstance) {
        this._db = dbInstance;
    }

    /**
     * Get number of records in the store
     */
    get size() {
        return new Promise((resolve, reject) => {
            db.collection(collectionId).get()
                .then((snapshot) => resolve(snapshot.length))
                .catch(error => reject(error));
        });
    }

    getFirst() {
        return new Promise((resolve, reject) => {
            db.collection(collectionId).get()
                .then((snapshot) => {
                    // snapshot.forEach((doc) => {
                    //     console.log(doc.id, '=>', doc.data());
                    // });

                    if (snapshot.length > 0) {
                        resolve(snapshot[0]);
                    } else {
                        reject(new Error("Record not found"));
                    }  
                })
                .catch((error) => {
                    console.log('Error getting documents', error);
                    reject(error);
                });
        });
    }

    /**
     * 
     * @param {object} query 
     * @param {number} query.id of the object to find
     */
    async find(query) {
        // get document reference, will create new one if does not exist
        // const docRef = this._db.collection(collectionId).doc('alovelace');

        // read data from document
        const docRef = this._db.collection(collectionId).doc(query.id);

        // This gets the whole collection
        // db.collection(collectionId).get()
        //     .then((snapshot) => {
        //         snapshot.forEach((doc) => {
        //             console.log(doc.id, '=>', doc.data());
        //         });
        //     })
        //     .catch((err) => {
        //         console.log('Error getting documents', err);
        //     });

        return new FirestoreRecord(this._db, docRef);
    }

    async insert(data) {
        // get document reference, will create new one if does not exist
        const docRef = this._db.collection(collectionId).doc(data.id);

        // write data to that document
        const docWriteResult = docRef.set(data);

        console.log("Firebase write:", docWriteResult);

        return new FirestoreRecord(this._db, docRef);
    }
}

class FirestoreRecord {
    constructor(dbReference, recordReference, recordIndex) {
        this._db = dbReference;
        this._ref = recordReference;
        // not very useful, it's an array, if data is removed `recordIndex` is no longer valid...
        // could implement own map in the DB instance object to keep track of the records... 🤔
        this._recordIndex = recordIndex;
        this._isDeleted = false;
    }

    get data() {
        return this._ref.data();
    }

    async set(newData) {
        this._ref.set(newData);

        this._ref.set(newData);

        // return new ref???
    }

    async delete() {
        throw new Error('Deleting FirestoreRecord not implemented');
    }
}

const getDB = async (dbLocation) => {
    console.log("[FIREBASE:] getDB - START");
    if (admin.apps.length) {
        console.log("[FIREBASE:] HAS APP!");
        return new FirestoreConnection(admin.firestore());
    }

    console.log("[FIREBASE:] initializeApp");
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccountJSON),
        databaseURL: 'https://doms-slack.firebaseio.com/'
    });

    console.log("[FIREBASE:] get firestore");
    const firestoreDB = admin.firestore();
    console.log("[FIREBASE:] settings");
    firestoreDB.settings({ timestampsInSnapshots: true });
    console.log("[FIREBASE:] return new FirestoreConnection");
    return new FirestoreConnection(firestoreDB);
};

module.exports = { getDB };