/**
 * Note: When using the Node.JS APIs, the config file
 * doesn't apply. Instead, pass options directly to the APIs.
 *
 * All configuration options: https://remotion.dev/docs/config
 */

import { Config } from "@remotion/cli/config";
import { enableTailwind } from '@remotion/tailwind-v4';
import path from 'path';
import fs from 'fs';

function buildPackageAliases(): Record<string, string> {
  const aliases: Record<string, string> = {};
  const packagesRoot = path.resolve(process.cwd(), '../../packages');
  const studioDir = path.join(packagesRoot, '@studio');
  if (fs.existsSync(studioDir)) {
    for (const pkg of fs.readdirSync(studioDir)) {
      const pkgJson = path.join(studioDir, pkg, 'package.json');
      if (fs.existsSync(pkgJson)) {
        const {name} = JSON.parse(fs.readFileSync(pkgJson, 'utf-8'));
        aliases[name] = path.join(studioDir, pkg, 'src');
      }
    }
  }
  return aliases;
}

Config.setVideoImageFormat("jpeg");
Config.setOverwriteOutput(true);
Config.overrideWebpackConfig((currentConfig) => {
  const withTailwind = enableTailwind(currentConfig);
  return {
    ...withTailwind,
    resolve: {
      ...withTailwind.resolve,
      alias: {
        ...withTailwind.resolve?.alias,
        ...buildPackageAliases(),
      },
    },
  };
});
