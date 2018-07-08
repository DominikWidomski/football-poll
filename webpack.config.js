const webpack = require("webpack");
const nodeExternals = require('webpack-node-externals');

module.exports = {
    // excluding node dependencies because of a seeming bug in `encoding`
    target: 'node',
    externals: [nodeExternals()],

    plugins: [
        new webpack.DefinePlugin({
            "process.env": {
                NODE_ENV: JSON.stringify(process.env.NODE_ENV || "development")
            }
        })
    ]
};