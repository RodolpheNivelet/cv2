const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = function(env) {

  var config = {
    context: __dirname + "/src",
    entry: './index.js',
    output: {
      filename: (env.production ? '[id].[hash]' : '[name]') + '.js',
      path: path.resolve(__dirname, env.production ? 'dist' : 'dev-dist')
    },
    module: {
      rules: [
        {
          test: /\.(html)$/,
          use: {
            loader: 'html-loader'
          }
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
