const HtmlWebpackPlugin = require('html-webpack-plugin');
const ModuleFederationPlugin = require('webpack/lib/container/ModuleFederationPlugin');
const path = require('path');

module.exports = {
  entry: './src/index.ts',
  mode: 'development',
  devServer: {
    port: 3000,
    historyApiFallback: true,
    hot: true,
  },
  resolve: {
    extensions: ['.ts', '.tsx', '.js', '.jsx'],
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: 'ts-loader',
        exclude: /node_modules/,
      },
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader'],
      },
      {
        test: /\.(png|svg|jpg|jpeg|gif)$/i,
        type: 'asset/resource',
      },
    ],
  },
  plugins: [
    new ModuleFederationPlugin({
      name: 'shell',
      remotes: {
        cardManagement: 'cardManagement@http://localhost:3001/remoteEntry.js',
        marketAnalysis: 'marketAnalysis@http://localhost:3002/remoteEntry.js',
        aiEcosystem: 'aiEcosystem@http://localhost:3003/remoteEntry.js',
        userManagement: 'userManagement@http://localhost:3004/remoteEntry.js',
        investmentPortfolio:
          'investmentPortfolio@http://localhost:3005/remoteEntry.js',
        socialFeatures: 'socialFeatures@http://localhost:3006/remoteEntry.js',
      },
      shared: {
        react: { singleton: true, requiredVersion: '^18.2.0' },
        'react-dom': { singleton: true, requiredVersion: '^18.2.0' },
        'react-router-dom': { singleton: true, requiredVersion: '^6.8.0' },
        '@reduxjs/toolkit': { singleton: true, requiredVersion: '^1.9.0' },
        'react-redux': { singleton: true, requiredVersion: '^8.0.0' },
      },
    }),
    new HtmlWebpackPlugin({
      template: './public/index.html',
    }),
  ],
  output: {
    publicPath: 'auto',
    path: path.resolve(__dirname, 'dist'),
    filename: '[name].[contenthash].js',
    clean: true,
  },
};
