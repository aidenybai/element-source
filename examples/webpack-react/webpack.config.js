const HtmlWebpackPlugin = require("html-webpack-plugin");
const path = require("path");

module.exports = {
  entry: "./src/index.tsx",
  output: { path: path.resolve(__dirname, "dist"), filename: "bundle.js", clean: true },
  resolve: { extensions: [".tsx", ".ts", ".js"] },
  module: {
    rules: [{ test: /\.tsx?$/, use: "babel-loader", exclude: /node_modules/ }],
  },
  plugins: [new HtmlWebpackPlugin({ template: "./index.html" })],
  devServer: { port: 4180, open: false },
};
