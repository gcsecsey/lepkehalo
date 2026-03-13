const {
  withAppBuildGradle,
  withSettingsGradle,
  withDangerousMod,
} = require('expo/config-plugins');
const fs = require('fs');
const path = require('path');

/**
 * Expo config plugin for Detox Android E2E testing.
 *
 * Injects the full Detox Android setup into the generated native project:
 * 1. settings.gradle: includes the Detox native project
 * 2. build.gradle: testBuildType, bundleInDebug, test runner, and Detox dependency
 * 3. DetoxTest.java: the instrumentation test class Detox needs to communicate with the app
 */
module.exports = function withDetoxTestBuildType(config) {
  config = withDetoxSettingsGradle(config);
  config = withDetoxAppBuildGradle(config);
  config = withDetoxTestClass(config);
  return config;
};

function withDetoxSettingsGradle(config) {
  return withSettingsGradle(config, (config) => {
    let contents = config.modResults.contents;

    if (!contents.includes("include ':detox'")) {
      contents +=
        "\ninclude ':detox'\nproject(':detox').projectDir = new File(rootProject.projectDir, '../node_modules/detox/android/detox')\n";
    }

    config.modResults.contents = contents;
    return config;
  });
}

function withDetoxAppBuildGradle(config) {
  return withAppBuildGradle(config, (config) => {
    let contents = config.modResults.contents;

    if (!contents.includes('testBuildType')) {
      contents = contents.replace(
        /defaultConfig\s*\{/,
        `defaultConfig {\n        testBuildType System.getProperty('testBuildType', 'debug')`,
      );
    }

    if (!contents.includes('testInstrumentationRunner')) {
      contents = contents.replace(
        /defaultConfig\s*\{/,
        `defaultConfig {\n        testInstrumentationRunner 'androidx.test.runner.AndroidJUnitRunner'`,
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

    if (!contents.includes("androidTestImplementation(project(':detox'))")) {
      contents = contents.replace(
        /dependencies\s*\{/,
        `dependencies {\n    androidTestImplementation(project(':detox'))`,
      );
    }

    config.modResults.contents = contents;
    return config;
  });
}

function withDetoxTestClass(config) {
  return withDangerousMod(config, [
    'android',
    async (config) => {
      const packageName = config.android?.package || 'hu.lepkehalo.app';
      const packagePath = packageName.replace(/\./g, '/');
      const testDir = path.join(
        config.modRequest.platformProjectRoot,
        'app/src/androidTest/java',
        packagePath,
      );

      fs.mkdirSync(testDir, { recursive: true });

      const testFile = path.join(testDir, 'DetoxTest.java');
      fs.writeFileSync(
        testFile,
        `package ${packageName};

import com.wix.detox.Detox;
import com.wix.detox.config.DetoxConfig;

import org.junit.Rule;
import org.junit.Test;
import org.junit.runner.RunWith;

import androidx.test.ext.junit.runners.AndroidJUnit4;
import androidx.test.filters.LargeTest;
import androidx.test.rule.ActivityTestRule;

@RunWith(AndroidJUnit4.class)
@LargeTest
public class DetoxTest {
    @Rule
    public ActivityTestRule<MainActivity> mActivityRule =
            new ActivityTestRule<>(MainActivity.class, false, false);

    @Test
    public void runDetoxTests() {
        DetoxConfig detoxConfig = new DetoxConfig();
        detoxConfig.idlePolicyConfig.masterTimeoutSec = 90;
        detoxConfig.idlePolicyConfig.idleResourceTimeoutSec = 60;
        detoxConfig.rnContextLoadTimeoutSec = (BuildConfig.DEBUG ? 180 : 60);

        Detox.runTests(mActivityRule, detoxConfig);
    }
}
`,
      );

      return config;
    },
  ]);
}
