const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');

module.exports = function(env) {

  var config = {
    context: __dirname + "/src",
    entry: './index.js',
    output: {
      filename: (env.production ? '[id].[hash]' : '[name]') + '.js',
      path: __dirname + '/dist'
    },
    module: {
      rules: [
        {
          test: /\.(html)$/,
          use: {
            loader: 'html-loader'
          }
        },
        {
          test: /\.(png|svg|jpg|gif)$/,
          use: [
            'file-loader'
          ]
        }
      ]
    },
    plugins: [
      new HtmlWebpackPlugin({
        template: './index.html'
      }),
      new CopyWebpackPlugin([{from: './pages', to: 'pages'}])
    ]
  };

  if (env.dev) {
    config.devServer = {
      contentBase: path.join(__dirname, 'dist'),
      port: 9000
    }
  }

  return config;
};
