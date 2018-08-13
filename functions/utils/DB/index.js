console.log('[FIREBASE:] index.js start');

const tinyDB = require('./tinyDB');
const firebase = require('./firebase');

console.log('[FIREBASE:] index.js after requires');

// module.exports = process.env.NODE_ENV === "development" ? tinyDB : firebase;
module.exports = firebase;

console.log('[FIREBASE:] index.js end');