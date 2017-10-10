const webpack = require('webpack')
const fs = require('fs')
const {resolve, join} = require('path')
const CopyWebpackPlugin = require('copy-webpack-plugin')
const ExtractTextPlugin = require('extract-text-webpack-plugin')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const LodashModuleReplacementPlugin = require('lodash-webpack-plugin')
const Visualizer = require('webpack-visualizer-plugin')
const { getIfUtils, removeEmpty } = require('webpack-config-utils')
const { ifProduction, ifNotProduction } = getIfUtils(process.env.NODE_ENV)
const nodeModules = {}

fs.readdirSync('node_modules')
  .filter(file => !file.includes('.bin'))
  .forEach((module) => {
    nodeModules[module] = `commonjs ${ module }`
  })

delete nodeModules['bootstrap']
nodeModules['react-dom/server'] = 'commonjs react-dom/server'

const baseConfig = {
  devtool: 'inline-source-map',
  output: {
    path: resolve('static'),
    chunkFilename: ifProduction('scripts/[id].chuck.js?v=[chunkhash]', 'scripts/[id].chuck.js'),
    publicPath: '/'
  },
  resolve: {
    modules: [
      resolve('client'),
      resolve('server'),
      resolve('shared'),
      'node_modules'
    ],
    extensions: ['.js', '.jsx', '.json']
  },
  stats: {
    colors: true,
    reasons: true,
    chucks: false
  },
  module: {
    rules: [
      // {
      //   test: /\.jsx?$/,
      //   loader: 'eslint-loader',
      //   enforce: 'pre',
      //   exclude: resolve(__dirname, 'node_modules')
      // },
      {
        test: /\.css$/,
        include: resolve(__dirname, 'shared'),
        loader: ExtractTextPlugin.extract({
          fallback: 'style-loader',
          use: [
            {
              loader: 'css-loader',
              query: {
                modules: true,
                sourceMap: true,
                importLoaders: 1,
                localIdentName: '[local]_[hash:base64:5]'
              }
            },
            {
              loader: 'postcss-loader'
            }
          ]
        })
      },
      {
        test: /\.css$/,
        exclude: resolve(__dirname, 'shared'),
        loader: ExtractTextPlugin.extract({
          fallback: 'style-loader',
          use: {
            loader: 'css-loader'
          }
        })
      },
      {
        test: /\.jsx?$/,
        exclude: resolve(__dirname, 'node_modules'),
        loader: 'babel-loader',
        query: {
          plugins: process.env.TARGET === 'node' ? [
            ["system-import-transformer", {"modules": "common"}]
          ] : []
        }
      },
      {
        test: /\.json$/,
        loader: 'json-loader'
      },
      {
        test: /\.(ttf|eot|otf|svg|woff(2)?)(\?[a-z0-9]+)?$/,
        include: resolve(__dirname, 'shared', 'resources', 'fonts'),
        loader: 'url-loader',
        options: {
          limit: 1024,
          name: 'fonts/[name].[ext]'
        }
      },
      {
        test: /\.(ico|png|jpg|svg|gif)$/,
        include: resolve(__dirname, 'shared', 'resources', 'images'),
        loader: 'url-loader',
        options: {
          limit: 10240,
          name: 'images/[name].[ext]?v=[hash:base64:5]'
        }
      },
      {
        test: /\.svg$/,
        include: resolve(__dirname, 'shared', 'resources', 'icons'),
        loaders: [
          'babel-loader',
          'svg-react-loader'
        ]
      }
    ]
  },
  plugins: removeEmpty([
    ifNotProduction(new Visualizer()),
    new LodashModuleReplacementPlugin(),
    new webpack.LoaderOptionsPlugin({
      minimize: true,
      debug: false
    }),
    new webpack.DefinePlugin({
      'process.env': {
        NODE_ENV: JSON.stringify(process.env.NODE_ENV || 'production'),
        APP_ENV: JSON.stringify(process.env.APP_ENV || 'production')
      }
    }),
    ifProduction(new webpack.optimize.UglifyJsPlugin({
      compress: {
        warnings: false,
        screw_ie8: true,
        conditionals: true,
        unused: true,
        comparisons: true,
        sequences: true,
        dead_code: true,
        evaluate: true,
        if_return: true,
        join_vars: true
      },
      mangle: process.env.TARGET !== 'node',
      output: {
        comments: false
      }
    })),
    new ExtractTextPlugin({
      filename: ifProduction('styles/bundle.css?v=[hash]', 'styles/bundle.css'),
      disable: process.env.NODE_ENV === 'development',
      allChunks: true
    }),
    new CopyWebpackPlugin([{
      from: join(__dirname, 'shared/resources/scripts'),
      to: join(__dirname, 'static/scripts')
    }], {copyUnmodified: true})
  ])
}

const clientConfig = Object.assign({}, baseConfig, {
  context: resolve('client'),
  entry: {
    jsx: ifNotProduction([
      'react-hot-loader/patch',
      'webpack-dev-server/client?http://0.0.0.0:3009',
      'webpack/hot/only-dev-server',
      './index.js'
    ], './index.js'),
    vendor: ifNotProduction([
      'react-hot-loader/patch',
      'webpack-dev-server/client?http://0.0.0.0:3009',
      'webpack/hot/only-dev-server',
      './index.js'
    ], []).concat([
      'core-js/es6',
      'react',
      'react-dom',
      'redux',
      'immutable',
      'react-router',
      'react-router-redux',
      'redux-actions',
      'redux-form',
      'redux-saga',
      'react-intl'
    ])
  },
  output: Object.assign({}, baseConfig.output, {
    filename: ifProduction('scripts/bundle.js?v=[hash]', 'scripts/bundle.js')
  }),
  plugins: baseConfig.plugins.concat(removeEmpty([
    ifNotProduction(new webpack.HotModuleReplacementPlugin()),
    ifNotProduction(new webpack.NamedModulesPlugin()),
    ifNotProduction(new webpack.NoEmitOnErrorsPlugin()),
    new webpack.optimize.CommonsChunkPlugin({
      name: 'vendor',
      filename: ifProduction('scripts/vendor.bundle.js?v=[hash]', 'scripts/vendor.bundle.js')
    }),
    new HtmlWebpackPlugin({
      inject: false,
      minify: {
        collapseWhitespace: true
      },
      template: 'index.html',
      appMountId: 'app',
      mobile: true
    })
  ])),
  devServer: {
    contentBase: './client',
    hot: true
  }
})

const serverConfig = Object.assign({}, baseConfig, {
  target: 'node',
  context: resolve('server'),
  devtool: false,
  entry: './index.js',
  output: Object.assign({}, baseConfig.output, {
    filename: 'app.js',
    libraryTarget: 'commonjs2'
  }),
  externals: nodeModules,
  node: {
    console: false,
    global: false,
    process: false,
    Buffer: false,
    __filename: false,
    __dirname: false
  },
  plugins: baseConfig.plugins.concat([
    new webpack.ExtendedAPIPlugin()
  ])
})

const configs = {
  web: clientConfig,
  node: serverConfig
}

module.exports = configs[process.env.TARGET]
