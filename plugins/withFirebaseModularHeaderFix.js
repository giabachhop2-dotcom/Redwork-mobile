const { withDangerousMod } = require("@expo/config-plugins");
const fs = require("fs");
const path = require("path");

/**
 * Expo Config Plugin: Fix Firebase "non-modular header" build errors on iOS.
 *
 * When `useFrameworks: "static"` is enabled (required by Firebase iOS SDK),
 * the RNFBApp pod fails to compile because React Native's headers
 * (RCTBridgeModule.h, RCTConvert.h, etc.) are not modular.
 *
 * This plugin injects a post_install hook into the generated Podfile
 * that sets CLANG_ALLOW_NON_MODULAR_INCLUDES_IN_FRAMEWORK_MODULES = YES
 * for all RNFB* targets, suppressing the -Wnon-modular-include error.
 */
function withFirebaseModularHeaderFix(config) {
  return withDangerousMod(config, [
    "ios",
    async (config) => {
      const podfilePath = path.join(
        config.modRequest.platformProjectRoot,
        "Podfile"
      );

      if (!fs.existsSync(podfilePath)) {
        console.warn(
          "[withFirebaseModularHeaderFix] Podfile not found, skipping."
        );
        return config;
      }

      let podfile = fs.readFileSync(podfilePath, "utf8");

      const snippet = `
    # [withFirebaseModularHeaderFix] Allow non-modular headers for Firebase pods
    installer.pods_project.targets.each do |target|
      if target.name.start_with?('RNFB')
        target.build_configurations.each do |bc|
          bc.build_settings['CLANG_ALLOW_NON_MODULAR_INCLUDES_IN_FRAMEWORK_MODULES'] = 'YES'
        end
      end
    end`;

      // Guard: don't inject twice
      if (podfile.includes("withFirebaseModularHeaderFix")) {
        return config;
      }

      // Inject into the existing post_install block
      if (podfile.includes("post_install do |installer|")) {
        podfile = podfile.replace(
          "post_install do |installer|",
          `post_install do |installer|${snippet}`
        );
      } else {
        // No post_install block exists — append one at the end
        podfile += `\npost_install do |installer|${snippet}\nend\n`;
      }

      fs.writeFileSync(podfilePath, podfile, "utf8");
      console.log(
        "[withFirebaseModularHeaderFix] Patched Podfile successfully."
      );

      return config;
    },
  ]);
}

module.exports = withFirebaseModularHeaderFix;
