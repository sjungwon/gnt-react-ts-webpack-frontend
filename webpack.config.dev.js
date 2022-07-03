const path = require("path");
const GetCSSModuleLocalIdent = require("react-dev-utils/getCSSModuleLocalIdent");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const CopyWebpackPlugin = require("copy-webpack-plugin");

module.exports = {
  entry: "./src/index.tsx",
  output: {
    path: path.resolve(__dirname, "dist"),
    filename: "main.js",
  },
  mode: "development",
  devServer: {
    compress: true,
    port: 3000,
  },
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
          "postcss-loader",
          "sass-loader",
        ],
      },
    ],
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: "./public/index.html",
    }),
    new CopyWebpackPlugin({
      patterns: [
        {
          from: path.resolve(__dirname, "public", "*"),
          to: "[path]/[name][ext]",
        },
      ],
    }),
  ],
};
