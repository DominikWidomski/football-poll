console.log('[FIREBASE:] index.js start');

const tinyDB = require('./tinyDB');
const firebase = require('./firebase');
const mongodb = require('./mongodb');

console.log('[FIREBASE:] index.js after requires');

// module.exports = process.env.NODE_ENV === "development" ? tinyDB : firebase;
// module.exports = firebase;
module.exports = mongodb;

console.log('[FIREBASE:] index.js end');