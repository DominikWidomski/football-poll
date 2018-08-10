const tinyDB = require('./tinyDB');
const firebase = require('./firebase');

// module.exports = process.env.NODE_ENV === "development" ? tinyDB : firebase;
module.exports = firebase;