const { withDangerousMod, withXcodeProject } = require("@expo/config-plugins");
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
 * With Xcode 16's ExplicitPrecompiledModules, the old approach of just
 * setting CLANG_ALLOW_NON_MODULAR_INCLUDES_IN_FRAMEWORK_MODULES on
 * specific targets is not enough. We must also explicitly disable EXPLICIT_MODULES
 * on both the Pods project and the main Workspace project.
 */
function withFirebaseModularHeaderFix(config) {
  // Step 1: Disable EXPLICIT_MODULES on the main App project
  config = withXcodeProject(config, (config) => {
    const xcodeProject = config.modResults;
    const buildConfigurations = xcodeProject.pbxXCBuildConfigurationSection();
    for (const key in buildConfigurations) {
      if (buildConfigurations[key].buildSettings) {
        buildConfigurations[key].buildSettings.EXPLICIT_MODULES = '"NO"';
      }
    }
    return config;
  });

  // Step 2: Inject into Podfile to configure Pods
  return withDangerousMod(config, [
    "ios",
    async (config) => {
      const podfilePath = path.join(
        config.modRequest.platformProjectRoot,
        "Podfile"
      );

      if (!fs.existsSync(podfilePath)) {
        console.warn("[RNFB-Fix] Podfile not found at " + podfilePath + ", skipping.");
        return config;
      }

      let podfile = fs.readFileSync(podfilePath, "utf8");

      if (podfile.includes("[RNFB-ModularHeaderFix]")) {
        console.log("[RNFB-Fix] Already patched, skipping.");
        return config;
      }

      const rubySnippet = [
        "    # [RNFB-ModularHeaderFix] Fix non-modular header errors for Firebase",
        "    installer.pods_project.build_configurations.each do |bc|",
        "      bc.build_settings['CLANG_ALLOW_NON_MODULAR_INCLUDES_IN_FRAMEWORK_MODULES'] = 'YES'",
        "      bc.build_settings['EXPLICIT_MODULES'] = 'NO'",
        "    end",
        "    installer.pods_project.targets.each do |target|",
        "      target.build_configurations.each do |bc|",
        "        bc.build_settings['CLANG_ALLOW_NON_MODULAR_INCLUDES_IN_FRAMEWORK_MODULES'] = 'YES'",
        "        bc.build_settings['EXPLICIT_MODULES'] = 'NO'",
        "        ['OTHER_CFLAGS', 'OTHER_CPLUSPLUSFLAGS'].each do |flag_key|",
        "          flags = bc.build_settings[flag_key] || '$(inherited)'",
        "          unless flags.include?('-Wno-error=non-modular-include-in-framework-module')",
        "            bc.build_settings[flag_key] = \"#{flags} -Wno-error=non-modular-include-in-framework-module -Wno-non-modular-include-in-framework-module\"",
        "          end",
        "        end",
        "      end",
        "    end",
      ].join("\n");

      const lines = podfile.split("\n");
      const postInstallStartIndex = lines.findIndex(l => l.match(/^\s*post_install\s+do\s+\|installer\|/));

      let injected = false;

      if (postInstallStartIndex > -1) {
        // Find indentation of the post_install block
        const indentMatch = lines[postInstallStartIndex].match(/^(\s*)/);
        const indentation = indentMatch ? indentMatch[1] : "";
        
        let insertIndex = -1;
        // Find the matching 'end' with the exact same indentation
        for (let i = postInstallStartIndex + 1; i < lines.length; i++) {
          if (lines[i] === indentation + "end") {
            insertIndex = i;
            break;
          }
        }
        
        if (insertIndex > -1) {
          lines.splice(insertIndex, 0, rubySnippet);
          podfile = lines.join("\n");
          injected = true;
          console.log("[RNFB-Fix] Injected successfully at the END of post_install block.");
        }
      }

      if (!injected) {
        // Fallback: append an override to the very end of the file
        podfile += "\npost_install do |installer|\n" + rubySnippet + "\nend\n";
        console.log("[RNFB-Fix] Appended new post_install block as fallback.");
      }

      fs.writeFileSync(podfilePath, podfile, "utf8");
      console.log("[RNFB-Fix] Podfile patched successfully.");

      return config;
    },
  ]);

  // Step 3: Patch node_modules directly to remove <React/...> angle brackets (Ultimate Fail-Safe)
  config = withDangerousMod(config, [
    "ios",
    async (config) => {
      const rnfbAppIosDir = path.join(
        config.modRequest.projectRoot,
        "node_modules",
        "@react-native-firebase",
        "app",
        "ios",
        "RNFBApp"
      );

      if (!fs.existsSync(rnfbAppIosDir)) {
        return config;
      }

      function replaceReactImports(dir) {
        const files = fs.readdirSync(dir);
        for (const file of files) {
          const fullPath = path.join(dir, file);
          if (fs.statSync(fullPath).isDirectory()) {
            replaceReactImports(fullPath);
          } else if (fullPath.endsWith(".h") || fullPath.endsWith(".m") || fullPath.endsWith(".mm")) {
            let content = fs.readFileSync(fullPath, "utf8");
            let modified = false;

            // Replace `#import <React/SomeHeader.h>` with `#import "SomeHeader.h"`
            const regex = /#import\s+<React\/([^>]+)>/g;
            if (regex.test(content)) {
              content = content.replace(regex, '#import "$1"');
              modified = true;
            }

            if (modified) {
              fs.writeFileSync(fullPath, content, "utf8");
              console.log("[RNFB-Fix] Patched React imports in: " + file);
            }
          }
        }
      }

      try {
        replaceReactImports(rnfbAppIosDir);
      } catch (e) {
        console.warn("[RNFB-Fix] Failed to patch node_modules: ", e);
      }

      return config;
    },
  ]);

  return config;
}

module.exports = withFirebaseModularHeaderFix;
