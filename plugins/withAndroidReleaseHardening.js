const { createRunOncePlugin, withAppBuildGradle } = require('expo/config-plugins');

const PLUGIN_NAME = 'with-android-release-hardening';
const PLUGIN_VERSION = '1.0.0';
const GRADLE_BLOCK_START = '// @generated begin DearDiary Android release dependency hardening';
const GRADLE_BLOCK_END = '// @generated end DearDiary Android release dependency hardening';

const RELEASE_EXCLUSIONS_BLOCK = `${GRADLE_BLOCK_START}
configurations.configureEach { configuration ->
  if (configuration.name.toLowerCase().contains('release')) {
    configuration.exclude group: 'androidx.test', module: 'core'
    configuration.exclude group: 'androidx.test', module: 'core-ktx'
    configuration.exclude group: 'androidx.compose.ui', module: 'ui-tooling'
  }
}
${GRADLE_BLOCK_END}`;

function countOccurrences(contents, value) {
  return contents.split(value).length - 1;
}

function addReleaseDependencyExclusions(contents) {
  if (!contents.includes('com.android.application') || !contents.includes('dependencies {')) {
    throw new Error(
      `${PLUGIN_NAME}: android/app/build.gradle does not contain the expected Android application structure.`,
    );
  }

  const startCount = countOccurrences(contents, GRADLE_BLOCK_START);
  const endCount = countOccurrences(contents, GRADLE_BLOCK_END);

  if (startCount !== endCount || startCount > 1) {
    throw new Error(`${PLUGIN_NAME}: generated Gradle block markers are missing or duplicated.`);
  }

  let nextContents = contents;
  if (startCount === 1) {
    const startIndex = nextContents.indexOf(GRADLE_BLOCK_START);
    const endIndex = nextContents.indexOf(GRADLE_BLOCK_END, startIndex);
    const blockEndIndex = endIndex + GRADLE_BLOCK_END.length;
    nextContents = `${nextContents.slice(0, startIndex)}${nextContents.slice(blockEndIndex)}`;
  }

  return `${nextContents.trimEnd()}\n\n${RELEASE_EXCLUSIONS_BLOCK}\n`;
}

function withAndroidReleaseHardening(config) {
  return withAppBuildGradle(config, (gradleConfig) => {
    if (gradleConfig.modResults.language !== 'groovy') {
      throw new Error(`${PLUGIN_NAME}: only Groovy Android app build files are supported.`);
    }

    gradleConfig.modResults.contents = addReleaseDependencyExclusions(
      gradleConfig.modResults.contents,
    );
    return gradleConfig;
  });
}

module.exports = createRunOncePlugin(withAndroidReleaseHardening, PLUGIN_NAME, PLUGIN_VERSION);
module.exports.addReleaseDependencyExclusions = addReleaseDependencyExclusions;
