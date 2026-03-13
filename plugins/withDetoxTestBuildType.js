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

    // RNGP skips JS bundling for variants in debuggableVariants (default: ['debug']).
    // When -PbundleInDebug is passed, clear the list so debug builds get a JS bundle.
    // Check for actual code assignment, not just comments mentioning debuggableVariants.
    if (!contents.match(/^\s*debuggableVariants\s*=/m)) {
      contents = contents.replace(
        /react \{/,
        `react {\n    if (project.hasProperty('bundleInDebug')) {\n        debuggableVariants = []\n    }`,
      );
    }

    config.modResults.contents = contents;
    return config;
  });
};
