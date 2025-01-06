require("babel-polyfill");
const webpack = require("webpack");
const path = require("path");
const TerserJSPlugin = require("terser-webpack-plugin");
const OptimizeCSSAssetsPlugin = require("optimize-css-assets-webpack-plugin");
const common = require("./webpack.common");

module.exports = {
  entry: {
    main: path.join(__dirname, "../src/index.js"),
  },
  output: {
    path: path.join(__dirname, "../build"),
    filename: "assets/js/[name].js",
    publicPath: "/",
  },
  optimization: {
    splitChunks: {
      chunks: "all",
    },
    minimize: true,
    minimizer: [new TerserJSPlugin({}), new OptimizeCSSAssetsPlugin({})],
  },
  ...common,
  plugins: [
    ...common.plugins,
    new webpack.DefinePlugin({
      "process.env.NODE_ENV": JSON.stringify("production"),
    }),
  ],
  stats: "errors-only",
};
