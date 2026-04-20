const { withDangerousMod, withXcodeProject } = require("@expo/config-plugins");
const fs = require("fs");
const path = require("path");

/**
 * Expo Config Plugin: Fix Firebase "non-modular header" build errors on iOS.
 *
 * ROOT CAUSE: @react-native-firebase/app imports React Native headers via
 * angle brackets (#import <React/RCTConvert.h>). When useFrameworks:"static"
 * is enabled, CocoaPods treats RNFB as a framework module, and Xcode 16's
 * ExplicitPrecompiledModules scans module maps BEFORE compiler flags take
 * effect. This means OTHER_CFLAGS like -Wno-error cannot suppress the error.
 *
 * SOLUTION (3-layer):
 *   1. Patch node_modules source files: Replace #import <React/X.h> with
 *      #import "X.h" so Clang never treats React as a framework import.
 *   2. Disable EXPLICIT_MODULES on the Xcode project to prevent the
 *      PrecompileModule .scan phase from running.
 *   3. Inject Podfile post_install settings as a safety net.
 */

// ─────────────────────────────────────────────────────────────────────────────
// Helper: recursively patch all .h/.m/.mm files in a directory
// ─────────────────────────────────────────────────────────────────────────────
function patchReactImportsInDir(dir) {
  if (!fs.existsSync(dir)) return 0;
  let patchedCount = 0;
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      patchedCount += patchReactImportsInDir(fullPath);
    } else if (/\.(h|m|mm)$/.test(entry.name)) {
      let content = fs.readFileSync(fullPath, "utf8");
      // Replace #import <React/Xxx.h> → #import "Xxx.h"
      const patched = content.replace(/#import\s+<React\/([^>]+)>/g, '#import "$1"');
      if (patched !== content) {
        fs.writeFileSync(fullPath, patched, "utf8");
        patchedCount++;
        console.log("[RNFB-Fix] Patched: " + fullPath);
      }
    }
  }
  return patchedCount;
}

// ─────────────────────────────────────────────────────────────────────────────
// Main plugin
// ─────────────────────────────────────────────────────────────────────────────
function withFirebaseModularHeaderFix(config) {
  // ── Step 1: Patch node_modules FIRST (most important) ──────────────────
  config = withDangerousMod(config, [
    "ios",
    async (config) => {
      const projectRoot = config.modRequest.projectRoot;
      const firebaseDirs = [
        path.join(projectRoot, "node_modules", "@react-native-firebase", "app", "ios"),
        path.join(projectRoot, "node_modules", "@react-native-firebase", "messaging", "ios"),
      ];

      let total = 0;
      for (const dir of firebaseDirs) {
        total += patchReactImportsInDir(dir);
      }
      console.log(`[RNFB-Fix] Step 1: Patched ${total} source file(s) in node_modules.`);
      return config;
    },
  ]);

  // ── Step 2: Disable EXPLICIT_MODULES on the main App .xcodeproj ────────
  config = withXcodeProject(config, (config) => {
    const xcodeProject = config.modResults;
    const buildConfigs = xcodeProject.pbxXCBuildConfigurationSection();
    let count = 0;
    for (const key in buildConfigs) {
      const bc = buildConfigs[key];
      if (bc && typeof bc === "object" && bc.buildSettings) {
        bc.buildSettings.CLANG_ALLOW_NON_MODULAR_INCLUDES_IN_FRAMEWORK_MODULES = "YES";
        bc.buildSettings.EXPLICIT_MODULES = "NO";
        count++;
      }
    }
    console.log(`[RNFB-Fix] Step 2: Set EXPLICIT_MODULES=NO on ${count} build configurations.`);
    return config;
  });

  // ── Step 3: Inject into Podfile post_install (safety net) ──────────────
  config = withDangerousMod(config, [
    "ios",
    async (config) => {
      const podfilePath = path.join(
        config.modRequest.platformProjectRoot,
        "Podfile"
      );

      if (!fs.existsSync(podfilePath)) {
        console.warn("[RNFB-Fix] Podfile not found, skipping Step 3.");
        return config;
      }

      let podfile = fs.readFileSync(podfilePath, "utf8");

      if (podfile.includes("[RNFB-ModularHeaderFix]")) {
        console.log("[RNFB-Fix] Podfile already patched, skipping.");
        return config;
      }

      const rubySnippet = [
        "",
        "    # [RNFB-ModularHeaderFix] Fix non-modular header errors for Firebase",
        "    installer.pods_project.build_configurations.each do |bc|",
        "      bc.build_settings['CLANG_ALLOW_NON_MODULAR_INCLUDES_IN_FRAMEWORK_MODULES'] = 'YES'",
        "      bc.build_settings['EXPLICIT_MODULES'] = 'NO'",
        "    end",
        "    installer.pods_project.targets.each do |target|",
        "      target.build_configurations.each do |bc|",
        "        bc.build_settings['CLANG_ALLOW_NON_MODULAR_INCLUDES_IN_FRAMEWORK_MODULES'] = 'YES'",
        "        bc.build_settings['EXPLICIT_MODULES'] = 'NO'",
        "        flags = bc.build_settings['OTHER_CFLAGS'] || '$(inherited)'",
        "        unless flags.include?('-Wno-non-modular-include-in-framework-module')",
        "          bc.build_settings['OTHER_CFLAGS'] = \"#{flags} -Wno-error=non-modular-include-in-framework-module -Wno-non-modular-include-in-framework-module\"",
        "        end",
        "      end",
        "    end",
        "",
      ].join("\n");

      const lines = podfile.split("\n");
      const postInstallIdx = lines.findIndex((l) =>
        /^\s*post_install\s+do\s+\|installer\|/.test(l)
      );

      let injected = false;

      if (postInstallIdx > -1) {
        const indent = (lines[postInstallIdx].match(/^(\s*)/) || ["", ""])[1];
        // Find matching 'end'
        for (let i = postInstallIdx + 1; i < lines.length; i++) {
          if (lines[i].trimEnd() === indent + "end") {
            lines.splice(i, 0, rubySnippet);
            podfile = lines.join("\n");
            injected = true;
            console.log("[RNFB-Fix] Step 3: Injected before 'end' of post_install.");
            break;
          }
        }
      }

      if (!injected) {
        podfile += "\npost_install do |installer|\n" + rubySnippet + "\nend\n";
        console.log("[RNFB-Fix] Step 3: Appended new post_install block.");
      }

      fs.writeFileSync(podfilePath, podfile, "utf8");
      return config;
    },
  ]);

  return config;
}

module.exports = withFirebaseModularHeaderFix;
