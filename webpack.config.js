module.exports = {
    entry: {
      'whatwg-fetch': 'whatwg-fetch',
      'app': './index.js'
    },

    output: {
      filename: '[name].js',
    },

    module: {
      loaders: [
        {
          test:    /\.elm$/,
          exclude: [/elm-stuff/, /node_modules/],
          loader:  'elm-webpack-loader?verbose=true&warn=true',
        },
      ],

      noParse: /\.elm$/,
    },

    devServer: {
      inline: true,
      stats: { colors: true },
    }
  };
