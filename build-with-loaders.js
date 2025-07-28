#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Create a temporary custom builder configuration
const customBuilderConfig = {
  "builders": {
    "@angular-devkit/build-angular:application": {
      "options": {
        "customWebpackConfig": {
          "path": "./webpack.extra.js",
          "mergeStrategies": {
            "module.rules": "append"
          }
        }
      }
    }
  }
};

// Write the configuration
fs.writeFileSync('angular-builders.json', JSON.stringify(customBuilderConfig, null, 2));

try {
  // Run the build with the custom configuration
  execSync('ng build --configuration production', { stdio: 'inherit' });
} catch (error) {
  process.exit(1);
} finally {
  // Clean up
  if (fs.existsSync('angular-builders.json')) {
    fs.unlinkSync('angular-builders.json');
  }
}
