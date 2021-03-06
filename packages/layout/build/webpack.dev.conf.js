'use strict'
const path = require('path')
const utils = require('./utils')
const config = require('./config')
const webpack = require('webpack')
const merge = require('webpack-merge')
const baseWebpackConfig = require('./webpack.base.conf')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const FriendlyErrorsPlugin = require('friendly-errors-webpack-plugin')
const portfinder = require('portfinder')
const address = require('address')
const localAddress = address.ip()

const HOST = process.env.HOST || config.dev.host
const PORT = process.env.PORT || config.dev.port
function resolve (dir) {
  return path.join(__dirname, '..', dir)
}

const devWebpackConfig = merge(baseWebpackConfig, {
  mode: 'development',
  output: {
    path: resolve('dist'),
    filename: '[name].js',
    publicPath: `http://${localAddress}:${PORT}/`,
    libraryTarget: 'umd'
  },
  // cheap-module-eval-source-map is faster for development
  devtool: 'eval-source-map',

  // these devServer options should be customized in /config/index.js
  devServer: {
    clientLogLevel: 'warning',
    historyApiFallback: true,
    hot: true,
    compress: true,
    host: HOST,
    port: PORT,
    open: false,
    overlay: { warnings: false, errors: true },
    publicPath: '/',
    proxy: {},
    quiet: true, // necessary for FriendlyErrorsPlugin
    watchOptions: {
      poll: false
    },
    headers: {
      'Access-Control-Allow-Origin': '*'
    }
  },
  module: {
    rules: [
      ...utils.styleLoaders({ sourceMap: false, usePostCSS: false })
    ]
  },
  plugins: [
    new webpack.DefinePlugin({
      _URL_: JSON.stringify(`http://${localAddress}`)
    }),
    new webpack.HotModuleReplacementPlugin(),
    new HtmlWebpackPlugin({
      filename: 'index.html',
      template: 'index.html',
      inject: true,
      chunks: ['app']
    })
  ]
})

module.exports = new Promise((resolve, reject) => {
  portfinder.basePort = PORT
  portfinder.getPort((err, port) => {
    if (err) {
      reject(err)
    } else {
      // publish the new Port, necessary for e2e tests
      process.env.PORT = port
      // add port to devServer config
      devWebpackConfig.devServer.port = port
      // Add FriendlyErrorsPlugin
      devWebpackConfig.plugins.push(new FriendlyErrorsPlugin({
        compilationSuccessInfo: {
          messages: [`Your application is running here: http://${localAddress}:${port}`]
        },
        onErrors: utils.createNotifierCallback()
      }))

      resolve(devWebpackConfig)
    }
  })
})
