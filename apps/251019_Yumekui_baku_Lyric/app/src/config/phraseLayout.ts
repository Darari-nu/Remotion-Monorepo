export type PhrasePosition = {
  x: number;
  y: number;
  z: number;
  rotateY?: number;
  rotateX?: number;
};

const POSITIONS: PhrasePosition[] = [
  { x: -360, y: -180, z: -420 },
  { x: 320, y: -150, z: -560 },
  { x: -280, y: 40, z: -680 },
  { x: 260, y: 100, z: -520 },
  { x: -340, y: -20, z: -840 },
  { x: 200, y: 60, z: -640 },
];

export const CAMERA_SPEED = 60;

export const getCameraZ = (time: number) => -Math.min(time * CAMERA_SPEED, 2000);

export const getPhrasePosition = (index: number): PhrasePosition => {
  const base = POSITIONS[index % POSITIONS.length];
  const round = Math.floor(index / POSITIONS.length);
  const depthShift = round * -250;
  const lateralShift = (round % 2 === 0 ? -1 : 1) * round * 60;
  const clamp = (value: number, min: number, max: number) =>
    Math.min(max, Math.max(min, value));
  return {
    x: clamp(base.x + lateralShift, -480, 480),
    y: clamp(base.y - round * 50, -260, 260),
    z: base.z + depthShift,
  };
};
