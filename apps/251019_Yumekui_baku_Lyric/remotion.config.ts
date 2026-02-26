import { Config } from "@remotion/cli/config";
import { enableSkia } from "@remotion/skia/enable";

Config.setVideoImageFormat("jpeg");
Config.setOverwriteOutput(true);
Config.setCodec("h264");
Config.setConcurrency(4);
Config.setChromiumOpenGlRenderer("angle");

Config.overrideWebpackConfig((current) => enableSkia(current));
