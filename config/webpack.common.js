require("babel-polyfill");
const path = require("path");
const webpack = require("webpack");
const CopyWebpackPlugin = require("copy-webpack-plugin");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const FixStyleOnlyEntriesPlugin = require("webpack-fix-style-only-entries");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const dotenv = require("dotenv");

const isProduction = process.env.NODE_ENV === "production";

if (!isProduction) {
  dotenv.config({ path: ".env.dev" });
}

module.exports = {
  module: {
    rules: [
      {
        test: /\.(js|jsx)$/,
        use: "babel-loader",
        exclude: /node_modules/,
      },
      {
        test: /\.css$/,
        use: ["style-loader", "css-loader"],
      },
      {
        test: /\.(png|woff|woff2|eot|ttf|gif|svg)$/,
        loader: "url-loader?limit=100000",
      },
      {
        test: /\.(scss)$/,
        use: [
          MiniCssExtractPlugin.loader,
          {
            loader: "css-loader",
            options: {
              url: false,
              sourceMap: !isProduction,
            },
          },
          {
            loader: "sass-loader",
            options: {
              sourceMap: !isProduction,
            },
          },
        ],
      },
      {
        test: /\.mjs$/,
        include: /node_modules/,
        type: "javascript/auto",
      },
    ],
  },
  plugins: [
    new FixStyleOnlyEntriesPlugin(),
    new CopyWebpackPlugin({
      patterns: [
        {
          from: path.resolve(__dirname + "./../public"),
          to: path.resolve(__dirname + "./../build"),
        },
      ],
    }),
    new HtmlWebpackPlugin({
      template: path.join(__dirname, "../public/index.html"),
      filename: "./index.html",
    }),
    new MiniCssExtractPlugin({
      filename: "assets/styles/[name].css",
    }),
    new webpack.DefinePlugin({
      "process.env.PORT": JSON.stringify(process.env.PORT),
      "process.env.AUTH_HOST": JSON.stringify(process.env.AUTH_HOST),
      "process.env.BACKEND_HOST": JSON.stringify(process.env.BACKEND_HOST),
      "process.env.PRINTER_ADDR": JSON.stringify(process.env.PRINTER_ADDR),
      "process.env.GOOGLE_MAP_API_KEY": JSON.stringify(
        process.env.GOOGLE_MAP_API_KEY
      ),
      "process.env.PUBLIC_URL": process.env.PUBLIC_URL
        ? JSON.stringify(process.env.PUBLIC_URL)
        : JSON.stringify(""),
      "process.env.LOGIN_REGION": JSON.stringify(process.env.LOGIN_REGION),
      "process.env.LOGIN_USER_POOL_ID": JSON.stringify(
        process.env.LOGIN_USER_POOL_ID
      ),
      "process.env.IDENTITY_POOL": JSON.stringify(process.env.IDENTITY_POOL),
      "process.env.LOGIN_APP_CLIENT_ID": JSON.stringify(
        process.env.LOGIN_APP_CLIENT_ID
      ),
      "process.env.LOGIN_OAUTH_DOMAIN": JSON.stringify(
        process.env.LOGIN_OAUTH_DOMAIN
      ),
      "process.env.BACKEND_AUTH": JSON.stringify(process.env.BACKEND_AUTH),
      "process.env.ORDER_HOST": JSON.stringify(process.env.ORDER_HOST),
      "process.env.REACT_APP_API_URL": JSON.stringify(
        process.env.REACT_APP_API_URL
      ),
      "process.env.REACT_APP_PIM_API_URL": JSON.stringify(
        process.env.REACT_APP_PIM_API_URL
      ),
      "process.env.REACT_APP_SECRET_KEY": JSON.stringify(
        process.env.REACT_APP_SECRET_KEY
      ),
      "process.env.REACT_APP_HI_GEARVN_API_URL": JSON.stringify(
        process.env.REACT_APP_HI_GEARVN_API_URL
      ),
    }),
  ],
  node: {
    net: "empty",
    tls: "empty",
    dns: "empty",
    fs: "empty",
  },
  resolve: {
    extensions: [".js", ".jsx", ".json"],
  },
};
