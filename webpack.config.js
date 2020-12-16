const path = require('path');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const NodemonPlugin = require('nodemon-webpack-plugin');

const server = {
  entry: './server/app.js',
  mode: 'production',
  target: 'node',
  output: {
    path: path.join(__dirname, 'build'),
    filename: 'server.js',
  },
  module: {
    rules: [
      {
        test: /\.(js|jsx)$/,
        use: 'babel-loader',
      },
    ],
  },
  plugins: [new CleanWebpackPlugin(), new NodemonPlugin()],
};

module.exports = server;
