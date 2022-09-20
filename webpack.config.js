const path = require("path");
const webpack = require("webpack");
const CopyPlugin = require("copy-webpack-plugin");
const { CleanWebpackPlugin } = require("clean-webpack-plugin");
 
module.exports = {
  mode: 'development',
  entry: {
    index:'./src/index.js'
  },
  optimization: {
    minimize: false, // set true in production build
    splitChunks: { // extract external dependenciesto to the separate file 
      cacheGroups: {
        external: {
          test: /[\\/]node_modules[\\/]/,
          name: 'external',
          chunks: 'all',
        }
      },
    },
  },
  output: {
    path: path.resolve(__dirname, "www"),
    filename: '[name].js',
  },
  plugins: [
    new CleanWebpackPlugin({
        root: path.resolve(__dirname, "www"),
        cleanOnceBeforeBuildPatterns: [ "**/*", "!.gitkeep"]
    }),
    new webpack.DefinePlugin({
        CANVAS_RENDERER: JSON.stringify(true),
        WEBGL_RENDERER: JSON.stringify(true)
    }),
  ],
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: "babel-loader"
        }
      },
      {
        test: [/\.vert$/, /\.frag$/],
        loader: "raw-loader",
        options: {
            name: '[path][name].[ext]',
        },
      },
      {
        test: /\.(htm?l|css|gif|png|jpe?g|svg|xml|ogg|mp3)$/i,
        loader: "file-loader",
        options: {
            name: '[path][name].[ext]',
            context: 'src'
        },
      }
    ]
  },
  devtool: 'inline-source-map', // rm in production build
  devServer: {
    hot: false
  }
};