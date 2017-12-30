const webpack = require('webpack');

module.exports = {
  entry: `${__dirname}/src/index.js`,
  output: {
    path: `${__dirname}/build`,
    publicPath: '/build/',
    filename: 'bundle.js',
  },

  module: {
    rules: [
      { test: /\.js$/, exclude: /node_modules/, loader: 'babel-loader' },
      { test: /\.css$/, loader: ['style-loader', 'css-loader']},
      { test: /\.scss$/, loader: ['style-loader', 'css-loader', 'sass-loader']},
      { test: /\.(csv|tsv)$/, loader: 'raw-loader'},
      { test: /\.(png|jpe?g|gif)$/, loader: 'file-loader'},
    ],
  },

  plugins: process.argv.indexOf('-p') === -1 ? [] : [
    new webpack.optimize.UglifyJsPlugin({
      output: {
        comments: false,
      },
    }),
  ],
};
