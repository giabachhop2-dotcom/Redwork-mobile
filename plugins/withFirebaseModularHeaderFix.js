const { withDangerousMod, withXcodeProject } = require("@expo/config-plugins");
const fs = require("fs");
const path = require("path");

/**
 * Expo Config Plugin: Fix Firebase iOS build errors.
 *
 * Fixes:
 *   1. "non-modular header" errors (Xcode 16 + useFrameworks:"static")
 *   2. nanopb "no such file or directory: '[,'" (OTHER_CFLAGS array parse bug)
 *
 * SOLUTIONS:
 *   Layer 1: Patch node_modules React imports in RNFB source.
 *   Layer 2: Disable EXPLICIT_MODULES on main .xcodeproj.
 *   Layer 3: Podfile post_install — fix EXPLICIT_MODULES + nanopb OTHER_CFLAGS.
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

  // ── Step 2: Disable EXPLICIT_MODULES & Fix Script Phases ───────────────
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

    // Suppress "Based on dependency analysis" warnings for scripts in Xcode 16
    const scriptPhases = xcodeProject.hash?.project?.objects?.PBXShellScriptBuildPhase;
    if (scriptPhases) {
      let phaseCount = 0;
      for (const key in scriptPhases) {
        const phase = scriptPhases[key];
        if (phase && typeof phase === "object" && phase.isa === "PBXShellScriptBuildPhase") {
          phase.alwaysOutOfDate = "1";
          phaseCount++;
        }
      }
      console.log(`[RNFB-Fix] Step 2.1: Set alwaysOutOfDate=1 on ${phaseCount} script phases.`);
    }

    return config;
  });

  // ── Step 3: Inject into Podfile post_install (safety net + nanopb fix) ─
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

      if (podfile.includes("[RNFB-ModularHeaderFix-v3]")) {
        console.log("[RNFB-Fix] Podfile already patched (v3), skipping.");
        return config;
      }

      // Remove old v1 marker if present
      podfile = podfile.replace(/# \[RNFB-ModularHeaderFix\][^\n]*\n/g, "");

      const rubySnippet = [
        "",
        "    # [RNFB-ModularHeaderFix-v3] Fix non-modular header + nanopb OTHER_CFLAGS errors",
        "    installer.pods_project.build_configurations.each do |bc|",
        "      bc.build_settings['CLANG_ALLOW_NON_MODULAR_INCLUDES_IN_FRAMEWORK_MODULES'] = 'YES'",
        "      bc.build_settings['EXPLICIT_MODULES'] = 'NO'",
        "    end",
        "    installer.pods_project.targets.each do |target|",
        "      target.build_phases.each do |phase|",
        "        if phase.respond_to?(:always_out_of_date=)",
        "          phase.always_out_of_date = '1'",
        "        end",
        "      end",
        "      target.build_configurations.each do |bc|",
        "        bc.build_settings['CLANG_ALLOW_NON_MODULAR_INCLUDES_IN_FRAMEWORK_MODULES'] = 'YES'",
        "        bc.build_settings['EXPLICIT_MODULES'] = 'NO'",
        "",
        "        # Fix nanopb 'no such file or directory: [,' error.",
        "        # Safely handle OTHER_CFLAGS and OTHER_CPLUSPLUSFLAGS by forcing Array to String",
        "        ['OTHER_CFLAGS', 'OTHER_CPLUSPLUSFLAGS'].each do |flag_key|",
        "          cflags = bc.build_settings[flag_key] || '$(inherited)'",
        "          if cflags.is_a?(Array)",
        "            cflags = cflags.join(' ')",
        "          end",
        "          if cflags.is_a?(String)",
        "            unless cflags.include?('-Wno-non-modular-include-in-framework-module')",
        "              cflags = cflags + ' -Wno-error=non-modular-include-in-framework-module -Wno-non-modular-include-in-framework-module'",
        "            end",
        "          end",
        "          bc.build_settings[flag_key] = cflags",
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
