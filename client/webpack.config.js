const { resolve } = require('path');

const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const HTMLWebpackPlugin = require('html-webpack-plugin');
const OptimizeCSSAssetsPlugin = require('optimize-css-assets-webpack-plugin');
const CopyPlugin = require('copy-webpack-plugin');
const TerserPlugin = require('terser-webpack-plugin');
const Dotenv = require('dotenv-webpack');

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
    keywords: Array.isArray(package.keywords) ? package.keywords.join(',') : undefined
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

  devServer: {
    port: 8080,
    overlay: true,
    stats: 'errors-only'
  },

  bail: true,

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
          {
            loader: 'postcss-loader'
          }
        ]
      },
      {
        test: /\.(sa|sc|c)ss$/,
        use: [!isProd ? 'style-loader' : MiniCssExtractPlugin.loader, 'css-loader', 'sass-loader', 'postcss-loader']
      },
      {
        test: /\.(gif|png|jpe?g|svg)$/i,
        include: resolve(__dirname, 'public'),
        loader: 'file-loader',
        options: {
          name: '[name].[hash:7].[ext]',
          outputPath: 'public/'
        }
      },
      {
        test: /\.(mp4|webm|ogg|mp3|wav|flac|aac)(\?.*)?$/,
        loader: 'url-loader',
        include: resolve(__dirname, 'public'),
        options: {
          limit: 8192,
          name: 'media/[name].[hash:7].[ext]'
        }
      }
    ]
  },

  performance: {
    maxEntrypointSize: 300000,
    hints: isProd ? 'warning' : false
  },

  optimization: isProd
    ? {
        minimizer: [
          new TerserPlugin({
            cache: true,
            parallel: true
          })
        ]
      }
    : {},

  plugins: [
    new Dotenv({
      path: isProd ? './.env.production' : './.env.development',
      safe: true
    }),

    HTMLWebpackPluginConfig,

    new MiniCssExtractPlugin({
      filename: 'css/[name].[hash].css'
    }),

    new OptimizeCSSAssetsPlugin(),

    new CopyPlugin([
      {
        from: resolve(__dirname, 'public'),
        to: resolve(__dirname, 'dist/public'),
        ignore: ['*.html']
      }
    ])
  ]
};
