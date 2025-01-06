require("babel-polyfill");
const path = require("path");
const common = require("./webpack.common");
const listProxy = require("../server/listProxy");
const redirectAuth = require("../server/auth/redirectAuth");

module.exports = {
  entry: ['./src/index.js'],
  output: {
    path: path.resolve('./build'),
    filename: "[name]-[hash].js",
    chunkFilename: '[name]-[chunkhash].js',
    publicPath: "/"
  },
  ...common,
  devServer: {
    host: "0.0.0.0",
    port: process.env.PORT || 3000,
    historyApiFallback: true,
    disableHostCheck: true,
    allowedHosts: [
      'localhost',
      '127.0.0.1',
      '.gearvn.xyz'
    ],
    hot: true,
    inline: true,
    proxy: listProxy,
    before: function(app, server, compiler) {
      redirectAuth(app);
    },
    contentBase: path.resolve('public'),
    watchOptions: {
      poll: true
    },
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, PATCH, OPTIONS',
      'Access-Control-Allow-Headers': 'X-Requested-With, content-type, Authorization'
    },
    sockHost: 'localhost',
    sockPort: 3000
  },
  devtool: "source-map",
};
