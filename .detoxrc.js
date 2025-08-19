/** @type {Detox.DetoxConfig} */
module.exports = {
  testRunner: 'jest',
  runnerConfig: 'e2e/config.json',
  configurations: {
    'ios.sim.debug': {
      type: 'ios.simulator',
      binaryPath: 'ios/build/Build/Products/Debug-iphonesimulator/CardStrategy.app',
      build: 'xcodebuild -workspace ios/CardStrategy.xcworkspace -scheme CardStrategy -configuration Debug -sdk iphonesimulator -derivedDataPath ios/build',
      device: {
        type: 'iPhone 15',
        os: 'iOS 17.0'
      }
    },
    'ios.sim.release': {
      type: 'ios.simulator',
      binaryPath: 'ios/build/Build/Products/Release-iphonesimulator/CardStrategy.app',
      build: 'xcodebuild -workspace ios/CardStrategy.xcworkspace -scheme CardStrategy -configuration Release -sdk iphonesimulator -derivedDataPath ios/build',
      device: {
        type: 'iPhone 15',
        os: 'iOS 17.0'
      }
    },
    'android.emu.debug': {
      type: 'android.emulator',
      binaryPath: 'android/app/build/outputs/apk/debug/app-debug.apk',
      build: 'cd android && ./gradlew assembleDebug assembleAndroidTest -DtestBuildType=debug && cd ..',
      device: {
        avdName: 'Pixel_4_API_30'
      }
    },
    'android.emu.release': {
      type: 'android.emulator',
      binaryPath: 'android/app/build/outputs/apk/release/app-release.apk',
      build: 'cd android && ./gradlew assembleRelease assembleAndroidTest -DtestBuildType=release && cd ..',
      device: {
        avdName: 'Pixel_4_API_30'
      }
    },
    'android.attached': {
      type: 'android.attached',
      binaryPath: 'android/app/build/outputs/apk/debug/app-debug.apk',
      build: 'cd android && ./gradlew assembleDebug assembleAndroidTest -DtestBuildType=debug && cd ..',
      device: {
        adbName: '.*'
      }
    }
  },
  artifacts: {
    plugins: {
      screenshot: {
        enabled: true,
        shouldTakeAutomaticSnapshots: true,
        keepOnlyFailedTestsArtifacts: true
      },
      video: {
        enabled: true,
        keepOnlyFailedTestsArtifacts: true
      },
      instruments: {
        enabled: false
      },
      log: {
        enabled: true,
        keepOnlyFailedTestsArtifacts: true
      }
    }
  }
};
