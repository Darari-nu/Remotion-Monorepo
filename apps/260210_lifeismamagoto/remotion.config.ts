import {Config} from '@remotion/cli/config';
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

Config.setVideoImageFormat('jpeg');
Config.setOverwriteOutput(true);
Config.overrideWebpackConfig((currentConfig) => ({
  ...currentConfig,
  resolve: {
    ...currentConfig.resolve,
    alias: {
      ...currentConfig.resolve?.alias,
      ...buildPackageAliases(),
    },
  },
}));
