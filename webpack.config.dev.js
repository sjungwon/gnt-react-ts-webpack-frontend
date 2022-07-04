const path = require("path");
const GetCSSModuleLocalIdent = require("react-dev-utils/getCSSModuleLocalIdent");
const CopyWebpackPlugin = require("copy-webpack-plugin");
const ESLintPlugin = require("eslint-webpack-plugin");
const HtmlWebpackPlugin = require("html-webpack-plugin");

module.exports = {
  entry: "./src/index.tsx",
  output: {
    path: path.resolve(__dirname, "dist"),
    filename: "main.js",
  },
  mode: "development",
  devServer: {
    historyApiFallback: { index: "/" },
    compress: true,
    port: 3000,
  },
  devtool: "source-map",
  resolve: {
    extensions: [".ts", ".tsx", ".js", ".css", ".scss"],
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        enforce: "pre",
        exclude: /node_modules/,
        loader: "source-map-loader",
      },
      {
        test: /\.ts(x?)$/,
        exclude: /node_modules/,
        use: ["babel-loader", "ts-loader"],
      },
      {
        test: /\.css$/i,
        exclude: /node_modules/,
        use: [
          "style-loader",
          "css-loader",
          {
            loader: "postcss-loader",
            options: {
              postcssOptions: {
                plugins: [["postcss-preset-env"]],
              },
            },
          },
        ],
      },
      {
        test: /\.s[ac]ss$/i,
        exclude: /node_modules/,
        use: [
          "style-loader",
          {
            loader: "css-loader",
            options: {
              modules: {
                getLocalIdent: GetCSSModuleLocalIdent,
              },
            },
          },
          {
            loader: "postcss-loader",
            options: {
              postcssOptions: {
                plugins: [["postcss-preset-env"]],
              },
            },
          },
          "sass-loader",
        ],
      },
    ],
  },
  plugins: [
    new HtmlWebpackPlugin({
      filename: "index.html",
      template: "public/index.html",
      favicon: "public/favicon.ico",
    }),
    new CopyWebpackPlugin({
      patterns: [
        {
          from: "./public/*",
          filter: (filePath) =>
            !filePath.includes(".html") && !filePath.includes("favicon.ico"),
        },
      ],
    }),
    new ESLintPlugin({
      extensions: ["ts", "tsx"],
      emitWarning: false,
    }),
  ],
};
