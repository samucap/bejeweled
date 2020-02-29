const path = require('path'),
  HtmlWebpackPlugin = require('html-webpack-plugin'),
  miniCssExtractPlugin = require('mini-css-extract-plugin');

const HtmlWebpackPluginConfig = new HtmlWebpackPlugin({
  template: path.join(__dirname, 'index.html'),
  inject: 'body',
  filename: 'index.html'
});

module.exports = {
  mode: 'development',
  entry: path.join(__dirname, 'js/main.js'),
  output: {
    filename: 'main.js',
    path: path.join(__dirname, 'dist'),
  },
  module: {
    rules: [
      {
        test: /\.(sa|sc|c)ss$/,
        use: [
          miniCssExtractPlugin.loader,
          'css-loader',
        ]
      },
    ]
  },
  resolve: {
    extensions: ['.js']
  },
  devtool: 'inline-source-map',
  devServer: {
    contentBase: path.join(__dirname, 'dist'),
    inline: true,
    stats: {
      colors: true,
      hash: false,
      timings: true,
      chunks: true,
      chunkModules: false,
      modules: false,
    },
    historyApiFallback: true,
    headers: {
      'Access-Control-Allow-Origin': '*'
    }
  },
  plugins: [
    HtmlWebpackPluginConfig,
    new miniCssExtractPlugin('[name].css'),
  ]
};
