// RELEVANT: https://firebase.google.com/docs/firestore/quickstart

const admin = require('firebase-admin');
const firebase = require("firebase");
// Required for side-effects
require("firebase/firestore");
const serviceAccountJSON = require('../../../doms-slack-786b1bf42868.json');

console.log("FIREBASE: start import");
console.log("FIREBASE: account", serviceAccountJSON);

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
    console.log("FIREBASE: getDB - START");
    if (admin.apps.length) {
        console.log("FIREBASE: HAS APP!");
        return new FirestoreConnection(admin.firestore());
    }

    console.log("FIREBASE: initializeApp");
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccountJSON),
        databaseURL: 'https://doms-slack.firebaseio.com/'
    });

    console.log("FIREBASE: get firestore");
    const firestoreDB = admin.firestore();
    console.log("FIREBASE: settings");
    firestoreDB.settings({ timestampsInSnapshots: true });
    console.log("FIREBASE: return new FirestoreConnection");
    return new FirestoreConnection(firestoreDB);
};

module.exports = { getDB };