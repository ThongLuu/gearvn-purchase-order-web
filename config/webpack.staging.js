require("babel-polyfill");
const webpack = require('webpack');
const path = require('path');
const TerserJSPlugin = require('terser-webpack-plugin');
const OptimizeCSSAssetsPlugin = require('optimize-css-assets-webpack-plugin');
const common = require('./webpack.common');
const listProxy = require("../server/listProxy");
const redirectAuth = require('../server/auth/redirectAuth');

module.exports = {
  entry: {
    main: path.join(__dirname, "../src/index.js"),
    style: path.join(__dirname, "../src/styles/index.scss")
  },
  output: {
    path: path.join(__dirname, '../build'),
    filename: 'assets/js/[name].js',
    publicPath: '/'
  },
  optimization: {
    splitChunks: {
      chunks: 'all'
    },
    minimize: true,
    minimizer: [new TerserJSPlugin({}), new OptimizeCSSAssetsPlugin({})]
  },
  ...common,
  plugins: [
    ...common.plugins,
    new webpack.DefinePlugin({
      'process.env.NODE_ENV': JSON.stringify('production')
    })
  ],
  devServer: {
    host: "0.0.0.0",
    port: process.env.PORT || 3000,
    watchOptions: {
      poll: true
    },
    historyApiFallback: true,
    disableHostCheck: true,
    proxy: listProxy,
    before: function (app, server, compiler) {
      redirectAuth(app);
    }
  },
  stats: 'errors-only'
};