require("dotenv").config();

const path = require('path');
const withSass = require("@zeit/next-sass");
const withLess = require("@zeit/next-less");
const Dotenv = require('dotenv-webpack');

// fix: prevents error when .less files are required by node
if (typeof require !== "undefined") {
  require.extensions[".less"] = (file) => {};
}

module.exports = withLess(
  withSass({
    ignoreOrder: true,
    lessLoaderOptions: {
      javascriptEnabled: true,
    },
    exportPathMap: () => ({}), // feature to pre-render some pages to html
    webpack: function (config, { isServer }) {
      config.plugins = config.plugins || [];

      if (isServer) {
        const antStyles = /antd\/.*?\/style.*?/
        const origExternals = [...config.externals]
        config.externals = [
          (context, request, callback) => {
            if (request.match(antStyles)) return callback()
            if (typeof origExternals[0] === 'function') {
              origExternals[0](context, request, callback)
            } else {
              callback()
            }
          },
          ...(typeof origExternals[0] === 'function' ? [] : origExternals),
        ]
  
        config.module.rules.unshift({
          test: antStyles,
          use: 'null-loader',
        })
      }
  
      config.plugins = [
        ...config.plugins,
  
        // Read the .env file
        new Dotenv({
          path: path.join(__dirname, ".env"),
          systemvars: true,
        }),
      ];
  
      return config;
    },
  })
);
