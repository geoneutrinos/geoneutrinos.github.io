var webpack = require('webpack');
var path = require('path');

var BUILD_DIR = path.resolve(__dirname, 'static/js/build');
var APP_DIR = path.resolve(__dirname, '');

var config = {
  entry: {
    reactors: APP_DIR + '/_jsx/reactors.jsx',
  },
  devtool: 'cheap-module-source-map',
  output: {
    path: BUILD_DIR,
    filename: '[name].js'
  },
  module : {
    loaders : [
      {
        test : /\.jsx?/,
        include : APP_DIR,
        loader : 'babel'
      },
      {
        test : /\.json?/,
        loader : 'json'
      }
    ]
  },
  plugins: [
    new webpack.DefinePlugin({
      'process.env':{
        'NODE_ENV': JSON.stringify('production')
      }
    })
  ]
};

module.exports = config;
