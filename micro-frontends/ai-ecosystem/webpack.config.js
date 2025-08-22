const HtmlWebpackPlugin = require('html-webpack-plugin');
const ModuleFederationPlugin = require('webpack/lib/container/ModuleFederationPlugin');

module.exports = {
  mode: 'development',
  devServer: {
    port: 3003,
    historyApiFallback: true,
    hot: true,
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
    ],
  },
  resolve: {
    extensions: ['.tsx', '.ts', '.js'],
  },
  plugins: [
    new ModuleFederationPlugin({
      name: 'aiEcosystem',
      filename: 'remoteEntry.js',
      exposes: {
        './AIDashboard': './src/components/AIDashboard',
        './CardScanner': './src/components/CardScanner',
        './MarketPredictor': './src/components/MarketPredictor',
        './RecommendationEngine': './src/components/RecommendationEngine',
        './DataAnalyzer': './src/components/DataAnalyzer',
        './AITraining': './src/components/AITraining',
      },
      shared: {
        react: { singleton: true },
        'react-dom': { singleton: true },
        'react-router-dom': { singleton: true },
        '@reduxjs/toolkit': { singleton: true },
        'react-redux': { singleton: true },
      },
    }),
    new HtmlWebpackPlugin({
      template: './public/index.html',
    }),
  ],
};
