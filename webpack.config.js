var nodeExternals = require('webpack-node-externals');

module.exports = {
    // excluding node dependencies because of a seeming bug in `encoding`
    externals: [nodeExternals()],
};