import { HopAnimationParams } from "./HopAnimation";

export const HOP_PRESETS: Record<string, HopAnimationParams> = {
  bouncy: {
    hopHeight: 80,
    hopDuration: 15,
    staggerDelay: 2,
    bounceEffect: true,
    rotation: 15,
    scale: 1.3,
    color: "#ffffff",
    highlightColor: "#ff6b9d",
  },
  elegant: {
    hopHeight: 50,
    hopDuration: 25,
    staggerDelay: 4,
    bounceEffect: false,
    rotation: 5,
    scale: 1.1,
    color: "#e0e0e0",
    highlightColor: "#ffd700",
  },
  powerful: {
    hopHeight: 120,
    hopDuration: 12,
    staggerDelay: 1,
    bounceEffect: true,
    rotation: 25,
    scale: 1.5,
    color: "#ffffff",
    highlightColor: "#ff4500",
  },
  cute: {
    hopHeight: 60,
    hopDuration: 20,
    staggerDelay: 3,
    bounceEffect: true,
    rotation: 10,
    scale: 1.2,
    color: "#ffb6c1",
    highlightColor: "#ff69b4",
  },
};
