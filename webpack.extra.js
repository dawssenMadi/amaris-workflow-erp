const path = require('path');

module.exports = (config) => {
  // Add loaders for font files
  config.module.rules.push({
    test: /\.(eot|woff|woff2|ttf|svg)(\?.*)?$/,
    type: 'asset/resource',
    generator: {
      filename: 'assets/fonts/[name][ext]'
    }
  });

  // Add specific loader for BPMN font files
  config.module.rules.push({
    test: /bpmn-js\/dist\/assets\/bpmn-font\/font\/.*\.(eot|woff|woff2|ttf|svg)$/,
    type: 'asset/resource',
    generator: {
      filename: 'assets/bpmn-font/font/[name][ext]'
    }
  });

  return config;
};
