const HtmlWebpackPlugin = require('html-webpack-plugin');
const ModuleFederationPlugin = require('webpack/lib/container/ModuleFederationPlugin');
const path = require('path');

module.exports = {
  entry: './src/index.ts',
  mode: 'development',
  devServer: {
    port: 3002,
    historyApiFallback: true,
    hot: true
  },
  resolve: {
    extensions: ['.ts', '.tsx', '.js', '.jsx']
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: 'ts-loader',
        exclude: /node_modules/
      },
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader']
      },
      {
        test: /\.(png|svg|jpg|jpeg|gif)$/i,
        type: 'asset/resource'
      }
    ]
  },
  plugins: [
    new ModuleFederationPlugin({
      name: 'marketAnalysis',
      filename: 'remoteEntry.js',
      exposes: {
        './MarketDashboard': './src/components/MarketDashboard',
        './PriceChart': './src/components/PriceChart',
        './MarketTrends': './src/components/MarketTrends',
        './PriceAlerts': './src/components/PriceAlerts',
        './MarketInsights': './src/components/MarketInsights',
        './TradingVolume': './src/components/TradingVolume'
      },
      shared: {
        react: { singleton: true, requiredVersion: '^18.2.0' },
        'react-dom': { singleton: true, requiredVersion: '^18.2.0' },
        'react-router-dom': { singleton: true, requiredVersion: '^6.8.0' },
        '@reduxjs/toolkit': { singleton: true, requiredVersion: '^1.9.0' },
        'react-redux': { singleton: true, requiredVersion: '^8.0.0' },
        'chart.js': { singleton: true, requiredVersion: '^4.0.0' },
        'react-chartjs-2': { singleton: true, requiredVersion: '^5.0.0' }
      }
    }),
    new HtmlWebpackPlugin({
      template: './public/index.html'
    })
  ],
  output: {
    publicPath: 'auto',
    path: path.resolve(__dirname, 'dist'),
    filename: '[name].[contenthash].js',
    clean: true
  }
};
