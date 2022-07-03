const path = require("path");
const GetCSSModuleLocalIdent = require("react-dev-utils/getCSSModuleLocalIdent");
const ForkTsCheckerWebpackPlugin = require("fork-ts-checker-webpack-plugin");
const { CleanWebpackPlugin } = require("clean-webpack-plugin");
const CopyWebpackPlugin = require("copy-webpack-plugin");
const MiniCSSExtractPlugin = require("mini-css-extract-plugin");

module.exports = {
  entry: "./src/index.tsx",
  output: {
    path: path.resolve(__dirname, "dist"),
    filename: "main.js",
  },
  mode: "production",
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
          {
            loader: MiniCSSExtractPlugin.loader,
            options: {
              publicPath: (resourcePath, context) => {
                return path.relative(path.dirname(resourcePath), context) + "/";
              },
            },
          },
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
    new ForkTsCheckerWebpackPlugin(),
    new CleanWebpackPlugin({ cleanAfterEveryBuildPatterns: ["dist"] }),
    new CopyWebpackPlugin({
      patterns: [
        {
          from: path.resolve(__dirname, "public", "*"),
          to: "[path]/[name][ext]",
        },
      ],
    }),
    new MiniCSSExtractPlugin({ filename: "style.css" }),
  ],
};
