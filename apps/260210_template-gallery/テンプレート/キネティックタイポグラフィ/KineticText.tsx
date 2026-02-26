import React from 'react';
import { AbsoluteFill } from 'remotion';
import { z } from 'zod';
import { zColor } from '@remotion/zod-types';
import { SharpRevealText } from './SharpRevealText';

// Define the schema using Zod & Remotion types for Studio controls
export const kineticTextSchema = z.object({
    text: z.string().default('KINETIC\nTYPOGRAPHY'),
    // Animation Mode
    mode: z.enum([
        'random',
        'wipe-right', 'wipe-up', 'slice-diagonal',
        'box-expand', 'circle-expand', 'diamond-expand', 'shutter-vertical'
    ]).default('random').describe('アニメーションの種類'),

    // Style
    fontSize: z.number().min(10).max(500).default(120),
    fontFamily: z.string().default('"Zen Old Mincho", "Hiragino Mincho ProN", serif'),
    fontWeight: z.string().default('bold'),
    color: zColor().default('#ffffff'),
    accentColor: zColor().default('#808080').describe('図形/アクセント色'),

    // Spacing & Layout
    letterSpacing: z.string().default('0.2em'),
    lineGap: z.number().default(20), // Spacing between lines if multiline

    // Thickness controls
    lineThickness: z.number().min(1).default(5).describe('線の太さ'),
    boxThickness: z.number().min(1).default(5).describe('枠の太さ'),
    hexagonThickness: z.number().min(1).default(5).describe('六角形の太さ'),

    // Animation Physics
    charDuration: z.number().min(1).default(15).describe('1文字のアニメーション時間(frame)'),
    stagger: z.number().default(3).describe('文字ごとの遅延(frame)'),
    jitter: z.number().default(15).describe('出現位置のランダム幅'),
    jitterRotation: z.number().default(5).describe('出現回転のランダム幅'),

    // Visibility
    shadowBlur: z.number().default(10),
    shadowColor: zColor().default('rgba(0,0,0,0.8)'),
});

export type KineticTextProps = z.infer<typeof kineticTextSchema>;

export const KineticText: React.FC<KineticTextProps> = ({
    text,
    mode,
    fontSize,
    fontFamily,
    color,
    accentColor,
    letterSpacing,
    lineGap,
    lineThickness,
    boxThickness,
    hexagonThickness,
    charDuration,
    stagger,
    jitter,
    jitterRotation,
    shadowBlur,
    shadowColor,
}) => {
    // SharpRevealText handles individual lines if passed as newline separated string?
    // SharpRevealText expects `text` prop. 
    // Wait, SharpRevealText splits by line internally?
    // Let's check SharpRevealText implementation.
    // Yes, SharpRevealText splits by '\n'.

    return (
        <AbsoluteFill style={{
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: 'transparent',
        }}>
            <SharpRevealText
                text={text}
                // Override mode if restricted
                mode={mode === 'random' ? undefined : mode as any}
                fontSize={fontSize}
                fontFamily={fontFamily}
                color={color}
                accentColor={accentColor}
                letterSpacing={letterSpacing}
                lineGap={lineGap}

                // Physics
                charDuration={charDuration}
                stagger={stagger}
                jitter={jitter}
                jitterRotation={jitterRotation}

                // Thickness
                lineThickness={lineThickness}
                boxThickness={boxThickness}
                hexagonThickness={hexagonThickness}

                // Shadows
                shadowBlur={shadowBlur}
                shadowColor={shadowColor}

                // Defaults
                strokeWidth={0}
                strokeColor="transparent"
                vertical={false} // Use horizontal by default for the template? Or configurable? 
            // Let's assume horizontal for generic usage, but user can change if we exposed it. 
            // Adding vertical prop might be good.
            />
        </AbsoluteFill>
    );
};
