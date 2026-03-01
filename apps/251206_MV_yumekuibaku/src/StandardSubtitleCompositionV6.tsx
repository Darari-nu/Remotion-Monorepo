import React, { useEffect, useState } from 'react';
import {
    AbsoluteFill,
    staticFile,
    Video,
    useVideoConfig,
    Sequence,
} from 'remotion';
import { SharpRevealText } from './SharpRevealText';
import { z } from 'zod';

import { zColor } from '@remotion/zod-types';

// Define props schema
export const standardSubtitleV6Schema = z.object({
    fontSize: z.number().default(90),
    color: zColor().default('#ffffff'),
    letterSpacing: z.string().default('0.4em'),
    stagger: z.number().default(5),
    kanjiScale: z.number().default(1.1),
    kanaScale: z.number().default(0.9),
    jitter: z.number().default(10),
    lineGap: z.number().default(200),
    // Visibility
    shadowBlur: z.number().default(10),
    shadowColor: zColor().default('rgba(0,0,0,0.8)'),
    strokeWidth: z.number().default(0),
    strokeColor: zColor().default('rgba(0,0,0,0.5)'),
    accentColor: zColor().default('#808080').describe('Animation Shape Color'),
    // Split shape thickness
    lineThickness: z.number().default(5).describe('線の太さ (Wipe/Shutter)'),
    boxThickness: z.number().default(5).describe('枠の太さ (Box)'),
    hexagonThickness: z.number().default(5).describe('六角形の太さ (Hexagon)'),

    charDuration: z.number().min(1).default(15), // New prop for animation speed
});

// Define the interface locally or import it. Since srtParser has it exported, we can use it.
interface WhisperSubtitleItem {
    id: number;
    start: number;
    end: number;
    text: string;
}

export const StandardSubtitleCompositionV6: React.FC<z.infer<typeof standardSubtitleV6Schema>> = ({
    fontSize,
    color,
    letterSpacing,
    stagger,
    kanjiScale,
    kanaScale,
    jitter,
    lineGap,
    shadowBlur,
    shadowColor,
    strokeWidth,
    strokeColor,
    accentColor,
    lineThickness,
    boxThickness,
    hexagonThickness,
    charDuration,
}) => {
    const [subtitles, setSubtitles] = useState<WhisperSubtitleItem[]>([]);
    const { fps } = useVideoConfig();

    useEffect(() => {
        const loadSubtitles = async () => {
            try {
                // Race between fetch and a 2-second timeout
                // Add timestamp to prevent caching
                // Add timestamp to prevent caching
                const jsonUrl = staticFile('remotion_subtitles.json');
                const res = await Promise.race([
                    fetch(`${jsonUrl}?t=${Date.now()}`),
                    new Promise<Response>((_, reject) =>
                        setTimeout(() => reject(new Error('Timeout loading subtitles')), 2000)
                    ),
                ]);

                if (!res.ok) throw new Error('Failed to load subtitles');
                const data = await res.json();
                setSubtitles(data);
            } catch (err) {
                console.error('Failed to load Whisper subtitles:', err);
            }
        };

        loadSubtitles();
    }, []);

    // Render all subtitles in Sequence
    return (
        <AbsoluteFill style={{ backgroundColor: 'black' }}>
            <Video src={staticFile('yumekuibaku_720p.mp4')} />
            {subtitles.map((currentSubtitle, index) => {
                // Randomize mode based on index
                const modes = ['wipe-right', 'wipe-up', 'slice-diagonal', 'box-expand'] as const;
                const mode = modes[index % modes.length];

                return (
                    <Sequence
                        key={currentSubtitle.id}
                        from={currentSubtitle.start * fps}
                        durationInFrames={(currentSubtitle.end - currentSubtitle.start) * fps}
                    >
                        <div style={{
                            width: '100%',
                            height: '100%',
                            display: 'flex',
                            justifyContent: 'center',
                            alignItems: 'center',
                            flexDirection: 'row-reverse', // Vertical text lines layout
                        }}>
                            <SharpRevealText
                                text={currentSubtitle.text}
                                mode={mode}
                                durationInFrames={30} // Fixed intro duration
                                fontSize={fontSize}
                                color={color}
                                accentColor={accentColor}
                                letterSpacing={letterSpacing}
                                lineGap={lineGap}
                                vertical={true}
                                kanjiScale={kanjiScale}
                                kanaScale={kanaScale}
                                jitter={jitter}
                                strokeWidth={strokeWidth}
                                strokeColor={strokeColor}
                                shadowBlur={shadowBlur}
                                shadowColor={shadowColor}
                                charDuration={charDuration}
                                lineThickness={lineThickness}
                                boxThickness={boxThickness}
                                hexagonThickness={hexagonThickness}
                                specialEndingAnimation={currentSubtitle.id === 3}
                            />
                        </div>
                    </Sequence>
                );
            })}
        </AbsoluteFill>
    );
};

