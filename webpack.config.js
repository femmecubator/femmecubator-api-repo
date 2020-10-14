const webpack = require('webpack');
const path = require('path');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const CopyPlugin = require('copy-webpack-plugin');
const NodemonPlugin = require('nodemon-webpack-plugin');

const server = {
    entry: './server/app.js',
    mode: 'production',
    target: 'node',
    output: {
        path: path.resolve(__dirname, 'build'),
        filename: 'server.js'
    },
    module: {
        rules: [
            {
                test: /\.(js|jsx)$/,
                use: 'babel-loader'
            }
        ]
    },
    plugins: [
        new CleanWebpackPlugin(),
        new CopyPlugin({
            patterns: [
                {
                    from: 'manifest.yml',
                    context: path.resolve(__dirname),
                }
            ]
        }),
        new NodemonPlugin()
    ],
};

module.exports = server;
