require("babel-polyfill");
const path = require('path');
const webpack = require('webpack');
const nodeExternals = require('webpack-node-externals');
const CopyWebpackPlugin = require('copy-webpack-plugin');

module.exports = {
  // entry: {
  //   server: path.join(__dirname, "../server/server.js")
  // },
  output: {
    path: path.join(__dirname, '../build'),
    filename: '[name].js'
  },
  module: {
    rules: [
      {
        test: /\.(js|jsx)$/,
        use: "babel-loader",
        exclude: /node_modules/
      },
      {
        test: /\.css$/,
        use: ["style-loader", "css-loader"]
      }
    ]
  },
  node: {
    net: 'empty',
    tls: 'empty',
    dns: 'empty',
    fs: 'empty'
  },
  resolve: {
    extensions: [".js", ".jsx"],
    modules: [__dirname, 'node_modules']
  },
  plugins: [
    new CopyWebpackPlugin(
      // { patterns:
          [{
            from: path.resolve(__dirname + "/../server/auth"),
            to: path.resolve(__dirname + "/../build/auth")
          },
          {
            from: path.resolve(__dirname + "/../server/views"),
            to: path.resolve(__dirname + "/../build/views")
          },
          {
            from: path.resolve(__dirname + "/../server/listProxy.js"),
            to: path.resolve(__dirname + "/../build")
          },
          {
            from: path.resolve(__dirname + "/../server.js"),
            to: path.resolve(__dirname + "/../build")
          },
          {
            from: path.resolve(__dirname + "/../package.json"),
            to: path.resolve(__dirname + "/../build")
          }]
      // }
    )
  ],
  externals: [nodeExternals()],
  target: 'node'
};