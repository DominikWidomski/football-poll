const nodeExternals = require('webpack-node-externals');

module.exports = {
    // excluding node dependencies because of a seeming bug in `encoding`
    target: 'node',
    externals: [nodeExternals()],
};