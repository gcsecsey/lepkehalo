const { withAppBuildGradle } = require('expo/config-plugins');

/**
 * Expo config plugin that adds testBuildType support for Detox.
 *
 * Without this, Android always builds debug test APKs regardless of
 * the -DtestBuildType flag. This plugin injects the necessary config
 * so `./gradlew assembleAndroidTest -DtestBuildType=release` builds
 * a release test APK that can instrument a release app.
 */
module.exports = function withDetoxTestBuildType(config) {
  return withAppBuildGradle(config, (config) => {
    const contents = config.modResults.contents;
    if (contents.includes('testBuildType')) {
      return config;
    }
    config.modResults.contents = contents.replace(
      /defaultConfig\s*\{/,
      `defaultConfig {\n        testBuildType System.getProperty('testBuildType', 'debug')`,
    );
    return config;
  });
};
