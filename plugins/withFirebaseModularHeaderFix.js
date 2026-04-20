const { withDangerousMod } = require("@expo/config-plugins");
const fs = require("fs");
const path = require("path");

/**
 * Expo Config Plugin: Fix Firebase "non-modular header" build errors on iOS.
 *
 * Problem: @react-native-firebase/app imports React Native headers
 * (RCTBridgeModule.h, RCTConvert.h, etc.) which are NOT modular.
 * When useFrameworks:"static" is enabled, CocoaPods treats RNFB as a
 * framework module, triggering -Wnon-modular-include-in-framework-module.
 *
 * With Xcode 26's ExplicitPrecompiledModules, the old approach of just
 * setting CLANG_ALLOW_NON_MODULAR_INCLUDES_IN_FRAMEWORK_MODULES on
 * specific targets is not enough — it must be set at the PROJECT level
 * AND the warning must also be explicitly suppressed via compiler flags.
 *
 * This plugin injects code AFTER react_native_post_install() to ensure
 * our settings are not overridden by React Native's own post-install.
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
          "[RNFB-Fix] Podfile not found at " + podfilePath + ", skipping."
        );
        return config;
      }

      let podfile = fs.readFileSync(podfilePath, "utf8");

      // Guard: don't inject twice
      if (podfile.includes("[RNFB-ModularHeaderFix]")) {
        console.log("[RNFB-Fix] Already patched, skipping.");
        return config;
      }

      // The Ruby code to inject — applies fix at BOTH project and target level
      const rubySnippet = [
        "",
        "    # [RNFB-ModularHeaderFix] Fix non-modular header errors for Firebase",
        "    # Set at the Pods PROJECT level (needed for Xcode 26 ExplicitPrecompiledModules)",
        "    installer.pods_project.build_configurations.each do |bc|",
        "      bc.build_settings['CLANG_ALLOW_NON_MODULAR_INCLUDES_IN_FRAMEWORK_MODULES'] = 'YES'",
        "    end",
        "    # Set on every individual pod target + suppress warning via compiler flag",
        "    installer.pods_project.targets.each do |target|",
        "      target.build_configurations.each do |bc|",
        "        bc.build_settings['CLANG_ALLOW_NON_MODULAR_INCLUDES_IN_FRAMEWORK_MODULES'] = 'YES'",
        "        # Directly suppress the warning so -Werror does not catch it",
        "        flags = bc.build_settings['OTHER_CFLAGS'] || '$(inherited)'",
        "        unless flags.include?('-Wno-non-modular-include-in-framework-module')",
        "          bc.build_settings['OTHER_CFLAGS'] = \"#{flags} -Wno-non-modular-include-in-framework-module\"",
        "        end",
        "      end",
        "    end",
        "",
      ].join("\n");

      let injected = false;



      // Strategy 2: Inject at start of post_install
      if (!injected && podfile.includes("post_install do |installer|")) {
        podfile = podfile.replace(
          "post_install do |installer|",
          "post_install do |installer|" + rubySnippet
        );
        injected = true;
        console.log(
          "[RNFB-Fix] Injected at start of post_install block ✓"
        );
      }

      // Strategy 3: Append a new post_install block at the very end
      if (!injected) {
        podfile +=
          "\npost_install do |installer|" + rubySnippet + "\nend\n";
        injected = true;
        console.log("[RNFB-Fix] Appended new post_install block ✓");
      }

      fs.writeFileSync(podfilePath, podfile, "utf8");
      console.log("[RNFB-Fix] Podfile patched successfully.");

      // Log the post_install section for debugging
      const lines = podfile.split("\n");
      const postInstallIdx = lines.findIndex((l) =>
        l.includes("post_install")
      );
      if (postInstallIdx >= 0) {
        const section = lines
          .slice(postInstallIdx, postInstallIdx + 30)
          .join("\n");
        console.log(
          "[RNFB-Fix] post_install section preview:\n" + section
        );
      }

      return config;
    },
  ]);
}

module.exports = withFirebaseModularHeaderFix;
