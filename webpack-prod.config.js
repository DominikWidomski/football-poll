const webpack = require("webpack");
const nodeExternals = require('webpack-node-externals');

module.exports = {
    target: 'node',
    // externals: [nodeExternals()],
    
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