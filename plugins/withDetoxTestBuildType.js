const { withAppBuildGradle } = require('expo/config-plugins');

/**
 * Expo config plugin for Detox Android E2E testing.
 *
 * Adds two capabilities to the generated build.gradle:
 * 1. testBuildType support: allows -DtestBuildType=release to build release test APKs
 * 2. bundleInDebug support: allows -PbundleInDebug to embed the JS bundle in debug
 *    builds, so E2E tests work in CI without a Metro dev server
 */
module.exports = function withDetoxTestBuildType(config) {
  return withAppBuildGradle(config, (config) => {
    let contents = config.modResults.contents;

    if (!contents.includes('testBuildType')) {
      contents = contents.replace(
        /defaultConfig\s*\{/,
        `defaultConfig {\n        testBuildType System.getProperty('testBuildType', 'debug')`,
      );
    }

    // RNGP uses a bundleIn map property, not a direct bundleInDebug field
    if (!contents.includes('bundleIn')) {
      contents = contents.replace(
        /react \{/,
        `react {\n    if (project.hasProperty('bundleInDebug')) {\n        bundleIn = ["debug": true]\n    }`,
      );
    }

    config.modResults.contents = contents;
    return config;
  });
};
