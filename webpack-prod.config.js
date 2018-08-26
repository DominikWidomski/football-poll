const fs = require('fs');
const webpack = require("webpack");
const nodeExternals = require('webpack-node-externals');

var nodeModules = {};
fs.readdirSync('node_modules')
    .filter(function (x) {
        return ['.bin'].indexOf(x) === -1;
    })
    .forEach(function (mod) {
        nodeModules[mod] = 'commonjs ' + mod;
    });

module.exports = {
    target: 'node',
    // Had issues not including nodeExternals, things missing, I'm not sure what environment they run this in
    // externals: [nodeExternals()],
    externals: nodeModules,
    
    plugins: [
        new webpack.DefinePlugin({
            "process.env": {
                NODE_ENV: JSON.stringify(process.env.NODE_ENV || "production")
            }
        })
        // new webpack.IgnorePlugin(/\/iconv-loader$/)
        // new webpack.IgnorePlugin(/\/encoding$/)
    ],

    // node_modules: "<cwd>/node_modules"
};