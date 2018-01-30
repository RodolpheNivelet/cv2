const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = function(env) {

  var config = {
    context: __dirname + "/src",
    entry: './index.js',
    output: {
      filename: (env.production ? '[id].[hash]' : '[name]') + '.js',
      path: 'dist')
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
      })
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
