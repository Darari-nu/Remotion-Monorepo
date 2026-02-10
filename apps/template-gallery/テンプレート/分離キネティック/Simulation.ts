import { random } from 'remotion';

export interface LyricItem {
    f: number;
    t: string;
    s?: 'rect' | 'hex' | 'circle';
}

export interface SimulationState {
    characters: CharacterState[];
    shapes: ShapeState[];
}

interface CharacterState {
    text: string;
    x: number;
    y: number;
    scale: number;
    opacity: number;
    rotation: number;
}

interface ShapeState {
    type: 'rect' | 'hex' | 'circle';
    x: number;
    y: number;
    rot: number;
    p: number; // dynamic progress
    rectW?: number;
    rectH?: number;
    radius?: number;
    rectMode?: number;
}

// Internal objects for simulation (with velocity)
interface SimCharacter {
    text: string;
    x: number;
    y: number;
    vx: number;
    vy: number;
    scale: number;
    opacity: number;
    rotation: number;
    spawnFrame: number;
    randomSeed: number;
}

interface SimShape {
    type: 'rect' | 'hex' | 'circle';
    x: number;
    y: number;
    vx: number;
    vy: number;
    rot: number;
    vRot: number;
    spawnFrame: number;
    duration: number;
    animSpeedBase: number;
    rectMode: number;
    seed: number;
    rectW: number;
    rectH: number;
    radius: number;
}

const FRICTION = 0.90;
const BASE_DRIFT_X = -0.3;

export interface SimConfig {
    rectWidth: number;
    rectHeight: number;
    radius: number;
    physicsScale: number;
}

export const calculateSimulation = (
    timeline: LyricItem[],
    width: number,
    height: number,
    durationInFrames: number,
    config: SimConfig
): SimulationState[] => {
    const states: SimulationState[] = [];
    const { rectWidth, rectHeight, radius, physicsScale } = config;

    let activeCharacters: SimCharacter[] = [];
    let activeShapes: SimShape[] = [];

    // Seeded random helper
    const seededRandom = (seed: string) => random(seed);

    // Helpers for scaled physics
    const scaleVel = (v: number) => v * physicsScale;
    const scaleForce = (f: number) => f * physicsScale;

    // Helper to create character
    const createCharacter = (char: string, frame: number, seedSuffix: number): SimCharacter => {
        const seed = `char-${frame}-${seedSuffix}`;
        const spawnX = width * (0.85 + seededRandom(seed + '-x') * 0.05);
        const spawnY = height * (0.25 + seededRandom(seed + '-y') * 0.5);
        return {
            text: char,
            x: spawnX,
            y: spawnY,
            vx: scaleVel(-6),
            vy: scaleVel((seededRandom(seed + '-vy') - 0.5) * 6),
            scale: 1.6,
            opacity: 0,
            rotation: (seededRandom(seed + '-rot') - 0.5) * 0.2,
            spawnFrame: frame,
            randomSeed: seededRandom(seed + '-seed') * 100
        };
    };

    // Helper to create shape
    const createShape = (type: 'rect' | 'hex' | 'circle', x: number, y: number, frame: number, seedSuffix: number): SimShape => {
        const seed = `shape-${frame}-${seedSuffix}`;

        return {
            type,
            x,
            y,
            vx: scaleVel((seededRandom(seed + '-vx') - 0.5) * 4),
            vy: scaleVel((seededRandom(seed + '-vy') - 0.5) * 4),
            rot: seededRandom(seed + '-rot') * Math.PI,
            vRot: (seededRandom(seed + '-vrot') - 0.5) * 0.01,
            rectW: rectWidth,
            rectH: rectHeight,
            radius: radius,
            spawnFrame: frame,
            duration: 110,
            animSpeedBase: 0.12,
            rectMode: Math.floor(seededRandom(seed + '-mode') * 3),
            seed: seededRandom(seed + '-seed') * 100,
        };
    };

    const getDynamicProgress = (s: SimShape, currentFrame: number): number => {
        const age = currentFrame - s.spawnFrame;
        const entryLen = s.duration * s.animSpeedBase;
        const exitStart = s.duration * (1 - s.animSpeedBase);
        let rawP = 0;

        if (age < entryLen) rawP = age / entryLen;
        else if (age > exitStart) rawP = 1 - (age - exitStart) / entryLen;
        else if (age >= s.duration) return -1;
        else rawP = 1;

        if (rawP <= 0 || rawP >= 1) return rawP;
        if (s.type === 'rect') return rawP;

        const wobble = Math.sin(age * 0.2 + s.seed) * 0.15;
        let p = Math.pow(rawP, 1.5) + wobble;
        return Math.max(0, Math.min(1, p));
    };

    // Simulation Loop
    for (let f = 0; f < durationInFrames; f++) {
        const currentFrame = f;

        // 1. Spawn logic
        const matchingLyric = timeline.find(item => item.f === currentFrame);
        if (matchingLyric) {
            const newChar = createCharacter(matchingLyric.t, currentFrame, f);

            // Attraction force from existing objects (Impact)
            [...activeCharacters, ...activeShapes].forEach(obj => {
                const dx = obj.x - newChar.x;
                const dy = obj.y - newChar.y;
                const dist = Math.sqrt(dx * dx + dy * dy) || 1;
                const force = scaleForce(600) / (dist + 150);
                obj.vx += (dx / dist) * force;
                obj.vy += (dy / dist) * force;
            });

            activeCharacters.push(newChar);

            if (matchingLyric.s) {
                activeShapes.push(createShape(matchingLyric.s, newChar.x, newChar.y, currentFrame, f));
            }
        }

        // 2. Physics update
        activeCharacters.forEach(c => {
            const age = currentFrame - c.spawnFrame;
            c.scale += (1.0 - c.scale) * 0.12;
            c.opacity = Math.min(1, age / 10);
            c.vx += Math.sin(currentFrame * 0.04 + c.randomSeed) * 0.1 * physicsScale;
            c.vy += Math.cos(currentFrame * 0.03 + c.randomSeed) * 0.1 * physicsScale;
            c.vx += scaleVel(BASE_DRIFT_X);
            c.x += c.vx;
            c.y += c.vy;
            c.vx *= FRICTION;
            c.vy *= FRICTION;
        });

        activeShapes.forEach(s => {
            s.rot += s.vRot;
            s.vx += scaleVel(BASE_DRIFT_X);
            s.x += s.vx;
            s.y += s.vy;
            s.vx *= FRICTION;
            s.vy *= FRICTION;
        });

        // 3. Cleanup
        activeCharacters = activeCharacters.filter(c => c.x > -400);
        activeShapes = activeShapes.filter(s => getDynamicProgress(s, currentFrame) !== -1);

        // 4. Capture State
        states.push({
            characters: activeCharacters.map(c => ({
                text: c.text,
                x: c.x,
                y: c.y,
                scale: c.scale,
                opacity: c.opacity,
                rotation: c.rotation
            })),
            shapes: activeShapes.map(s => ({
                type: s.type,
                x: s.x,
                y: s.y,
                rot: s.rot,
                p: getDynamicProgress(s, currentFrame),
                rectW: s.rectW,
                rectH: s.rectH,
                radius: s.radius,
                rectMode: s.rectMode
            }))
        });
    }

    return states;
};
