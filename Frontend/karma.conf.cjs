const path = require('path');
const webpack = require('webpack');

module.exports = config => {
  config.set({
    frameworks: ['jasmine'],
    files: [{ pattern: 'tests/index.ts', watched: false }],
    preprocessors: { 'tests/index.ts': ['webpack', 'sourcemap'] },
    webpack: {
      mode: 'development',
      devtool: 'inline-source-map',
      resolve: { extensions: ['.ts', '.tsx', '.js'] },
      module: {
        rules: [
          {
            test: /\.tsx?$/,
            use: { loader: 'ts-loader', options: { configFile: path.resolve(__dirname, 'tsconfig.spec.json') } },
            exclude: /node_modules/
          },
          {
            test: /\.html$/i,
            loader: 'html-loader',
            options: {
              minimize: false,
              sources: false,
              esModule: true // critical: makes `import x from '*.html'` a string default export
            }
          },
          { test: /\.css$/i, use: ['style-loader', 'css-loader'] }
        ]
      },
      plugins: [
		new webpack.NormalModuleReplacementPlugin(
          /src\/app\.ts$/,
          path.resolve(__dirname, 'tests/mocks/app.mock.ts')
        ),
        new webpack.DefinePlugin({
          'process.env.APP_SECRET_KEY': JSON.stringify('test-secret'),
          'process.env.JWT_SECRET': JSON.stringify('test-jwt')
        })
      ]
    },
    plugins: [
      require('karma-jasmine'),
      require('karma-webpack'),
      require('karma-sourcemap-loader'),
      require('karma-firefox-launcher'),
      require('karma-jasmine-html-reporter')
    ],
    reporters: ['progress', 'kjhtml'],
    browsers: ['FirefoxHeadless'],
    singleRun: true,
    client: { clearContext: false }
  });
};
