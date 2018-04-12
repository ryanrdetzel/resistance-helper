const path = require('path');
const CopyWebpackPlugin = require('copy-webpack-plugin');

module.exports = {
  entry: './src/index.js',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'bundle.js'
  },
  mode: 'none',
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /(node_modules|bower_components)/,
        use: {
          loader: 'babel-loader',
        }
      }
    ]
  },
  plugins: [
    new CopyWebpackPlugin([
      {
        from: 'src/index.html',
        to: 'index.html',
        toType: 'file'
      },
      {
        from: 'src/index.css',
        to: 'index.css',
        toType: 'file'
      }
    ]),
  ],
  devtool: "eval",
  devServer: {
    watchContentBase: true,
    contentBase: path.join(__dirname, "dist"),
    compress: true,
    port: 9000
  }
};
