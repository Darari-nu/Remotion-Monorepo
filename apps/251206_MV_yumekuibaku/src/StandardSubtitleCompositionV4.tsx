import React, { useEffect, useState } from 'react';
import {
    AbsoluteFill,
    staticFile,
    Video,
    useVideoConfig,
    Sequence,
} from 'remotion';
import { FloatingSubtitleV4 } from './FloatingSubtitleV4';
import { z } from 'zod';

// Define props schema
export const standardSubtitleV4Schema = z.object({
    fontSize: z.number().default(90),
    color: z.string().default('#ffffff'),
    letterSpacing: z.string().default('0.1em'),
    animationSpeed: z.number().default(15),
    spread: z.number().default(200),
    stagger: z.number().default(5),
    kanjiScale: z.number().default(1.1),
    kanaScale: z.number().default(0.9),
    jitter: z.number().default(10),
    stiffness: z.number().min(0).default(200),
    damping: z.number().min(0).default(20),
    lineGap: z.number().default(20),
    // Visibility
    shadowBlur: z.number().default(10),
    shadowColor: z.string().default('rgba(0,0,0,0.8)'),
    strokeWidth: z.number().default(0),
    strokeColor: z.string().default('rgba(0,0,0,0.5)'),
});

// Define the interface locally or import it. Since srtParser has it exported, we can use it.
interface WhisperSubtitleItem {
    id: number;
    start: number;
    end: number;
    text: string;
}

export const StandardSubtitleCompositionV4: React.FC<z.infer<typeof standardSubtitleV4Schema>> = ({
    fontSize,
    color,
    letterSpacing,
    animationSpeed,
    spread,
    stagger,
    kanjiScale,
    kanaScale,
    jitter,
    stiffness,
    damping,
    lineGap,
    shadowBlur,
    shadowColor,
    strokeWidth,
    strokeColor,
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
            {subtitles.map((currentSubtitle) => (
                <Sequence
                    key={currentSubtitle.id}
                    from={currentSubtitle.start * fps}
                    durationInFrames={(currentSubtitle.end - currentSubtitle.start) * fps}
                >
                    <FloatingSubtitleV4
                        text={currentSubtitle.text}
                        enterFrame={0} // Relative to Sequence start
                        durationInFrames={(currentSubtitle.end - currentSubtitle.start) * fps}
                        fontSize={fontSize}
                        color={color}
                        letterSpacing={letterSpacing}
                        animationSpeed={animationSpeed}
                        spread={spread}
                        stagger={stagger}
                        kanjiScale={kanjiScale}
                        kanaScale={kanaScale}
                        jitter={jitter}
                        stiffness={stiffness}
                        damping={damping}
                        lineGap={lineGap}
                        shadowBlur={shadowBlur}
                        shadowColor={shadowColor}
                        strokeWidth={strokeWidth}
                        strokeColor={strokeColor}
                    />
                </Sequence>
            ))}
        </AbsoluteFill>
    );
};

