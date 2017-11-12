const path = require('path');
const webpack = require('webpack');
const SRC = path.resolve(__dirname, "frontend");

const sassLoader = {
  loader: 'sass-loader',
  options: {
    includePaths: ['node_modules'],
    sourceMap: true
  }
};

const config = module.exports = {
  entry: {
    index: './frontend/index.js'
  },
  output: {
    path: path.join(__dirname, 'build'),
    publicPath: '/build/',
    filename: '[name].js'
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        include: SRC,
        use: [{loader: 'babel-loader', options: {babelrc: true}}],
      },
      {
        test: /\.css$/,
        use: [{loader: 'style-loader'}, {loader: 'css-loader'}]
      },
      {
        test: /\.scss$/,
        use: [{loader: 'style-loader'}, {loader: 'css-loader'}, {loader: 'resolve-url-loader'}, sassLoader]
      },
      {
        test: /\.(eot|svg|ttf|woff(2)?)(\?v=\d+\.\d+\.\d+)?/,
        use: [{loader: 'file-loader', options: {name: 'fonts/[name].[ext]'}}]
      },
      {
        test: /\.(ico|gif|png|jpg|jpeg|svg)$/,
        use: [{loader: 'file-loader', options: {context: 'public', name: 'images/[name].[ext]'}}]
      }
    ]
  },
  plugins: [
    new webpack.DefinePlugin({
      'process.env': {
        'NODE_ENV': JSON.stringify(process.env.NODE_ENV)
      }
    }),
    new webpack.optimize.OccurrenceOrderPlugin(),
    new webpack.NoEmitOnErrorsPlugin(),
    new webpack.optimize.CommonsChunkPlugin({
      name: "vendor",
      filename: "vendor.js",
      minChunks: function (module) {
        return /node_modules/.test(module.resource);
      }
    })
  ]
};

if (process.env.NODE_ENV !== 'production') {
  config.devtool = 'inline-source-map';
} else {
  config.plugins.push(new webpack.optimize.UglifyJsPlugin({
    compress: {
      warnings: false
    }
  }));
}
