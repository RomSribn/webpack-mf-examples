const HtmlWebpackPlugin = require('html-webpack-plugin');
const { withZephyr } = require("zephyr-webpack-plugin");
const { ModuleFederationPlugin } = require('@module-federation/enhanced');
const path = require('path');

// adds all your dependencies as shared modules
// version is inferred from package.json in the dependencies
// requiredVersion is used from your package.json
// dependencies will automatically use the highest available package
// in the federated app, based on version requirement in package.json
// multiple different versions might coexist in the federated app
// Note that this will not affect nested paths like "lodash/pluck"
// Note that this will disable some optimization on these packages
// with might lead the bundle size problems
const deps = require('./package.json').dependencies;

module.exports = withZephyr()({
  entry: './src/index',
  cache: false,
  mode: 'development',
  devServer: {
    static: {
      directory: path.join(__dirname, 'dist'),
    },
    port: 3001,
  },
  target: 'web',
  output: {
    publicPath: 'auto',
  },
  module: {
    rules: [
      {
        test: /\.jsx?$/,
        loader: 'babel-loader',
        exclude: /node_modules/,
        options: {
          presets: ['@babel/preset-react'],
        },
      },
    ],
  },
  plugins: [
    new ModuleFederationPlugin({
      name: 'create_enchanced_webpack_mf_app1',
      filename: 'remoteEntry.js',
      remotes: {
        "create_enchanced_webpack_mf_app2": "create_enchanced_webpack_mf_app2",
      },
      runtimePlugins: [require.resolve('../control-share.js')],
      exposes: {
        './Button': './src/Button',
      },
      shared: {
        ...deps,
        react: {
          singleton: true,
        },
        'react-dom': {
          singleton: true,
        },
      },
    }),
    new HtmlWebpackPlugin({
      template: './public/index.html',
    }),
  ],
});
