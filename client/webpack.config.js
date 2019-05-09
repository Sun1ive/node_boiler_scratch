const { resolve, join } = require('path');
const { cpus } = require('os');

const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const HTMLWebpackPlugin = require('html-webpack-plugin');
const OptimizeCSSAssetsPlugin = require('optimize-css-assets-webpack-plugin');

const outPath = resolve(__dirname, './dist');
const sourcePath = resolve(__dirname, './src');
const package = require('./package.json');

const HTMLWebpackPluginConfig = new HTMLWebpackPlugin({
  template: resolve(__dirname, './public/index.html'),
  filename: 'index.html',
  inject: true,
  minify: {
    minifyJS: true,
    minifyCSS: true,
    removeComments: true,
    useShortDoctype: true,
    collapseWhitespace: true,
    collapseInlineTagWhitespace: true
  },
  meta: {
    title: package.name,
    description: package.description,
    keywords: Array.isArray(package.keywords)
      ? package.keywords.join(',')
      : undefined
  }
});

const isProd = process.env.NODE_ENV === 'production';

const stats = {
  assets: false,
  children: false,
  chunks: false,
  hash: false,
  modules: false,
  publicPath: false,
  timings: false,
  version: false,
  warnings: true,
  colors: {
    green: '\u001b[32m'
  },
  entrypoints: false
};

module.exports = {
  mode: isProd ? 'production' : 'development',

  entry: './src/index.tsx',

  output: {
    path: outPath,
    publicPath: '/',
    filename: 'js/[name].[hash:16].js'
  },

  stats,

  resolve: {
    extensions: ['.js', '.ts', '.tsx', '.scss', '.css'],
    mainFields: ['module', 'browser', 'main'],
    alias: {
      '@': resolve('./src')
    }
  },

  module: {
    rules: [
      {
        test: /\.tsx?$/,
        loader: 'awesome-typescript-loader'
      },

      {
        test: /\.css$/,
        use: [
          !isProd ? 'style-loader' : MiniCssExtractPlugin.loader,
          {
            loader: 'css-loader'
          },
          'postcss-loader'
        ]
      },

      {
        test: /\.s(a|c)ss$/,
        use: [
          !isProd ? 'style-loader' : MiniCssExtractPlugin.loader,
          {
            loader: 'css-loader'
          },
          'postcss-loader',
          'sass-loader'
        ]
      },

      {
        test: /\.(a?png|svg|jpg|gif)$/,
        loader: 'url-loader',
        include: resolve(__dirname, 'public'),
        options: {
          limit: 10000,
          name: 'img/[name].[hash:7].[ext]'
        }
      },

      {
        test: /\.(mp4|webm|ogg|mp3|wav|flac|aac)(\?.*)?$/,
        loader: 'url-loader',
        options: {
          limit: 10000,
          name: 'media/[name].[hash:7].[ext]'
        }
      },

      {
        test: /\.(mp4|webm|ogg|mp3|wav|flac|aac)(\?.*)?$/,
        loader: 'url-loader',
        options: {
          limit: 10000,
          name: 'media/[name].[hash:7].[ext]'
        }
      }
    ]
  },

  performance: {
    maxEntrypointSize: 300000,
    hints: isProd ? 'warning' : false
  },

  plugins: [
    HTMLWebpackPluginConfig,

    new MiniCssExtractPlugin({
      filename: 'css/[name].[hash].css'
    }),

    new OptimizeCSSAssetsPlugin()
  ]
};
