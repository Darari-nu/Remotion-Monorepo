import React, { useEffect, useState } from 'react';
import {
    AbsoluteFill,
    staticFile,
    Video,
    useVideoConfig,
    useCurrentFrame,
    continueRender,
    delayRender,
} from 'remotion';
import { FloatingSubtitle } from './FloatingSubtitle';
import { z } from 'zod';

// Define props schema
export const standardSubtitleV3Schema = z.object({
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
    lineGap: z.number().default(20), // Support line spacing
});

// Define the interface locally or import it. Since srtParser has it exported, we can use it.
interface WhisperSubtitleItem {
    id: number;
    start: number;
    end: number;
    text: string;
}

export const StandardSubtitleCompositionV3: React.FC<z.infer<typeof standardSubtitleV3Schema>> = ({
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
}) => {
    const [handle] = useState(() => delayRender());
    const [subtitles, setSubtitles] = useState<WhisperSubtitleItem[]>([]);
    const { fps } = useVideoConfig();
    const frame = useCurrentFrame();
    const currentTime = frame / fps;

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
            } finally {
                continueRender(handle);
            }
        };

        loadSubtitles();
    }, [handle]);

    // Find current subtitle
    const currentSubtitle = subtitles.find(
        (s) => currentTime >= s.start && currentTime < s.end
    );

    return (
        <AbsoluteFill style={{ backgroundColor: 'black' }}>
            <Video src={staticFile('yumekuibaku_720p.mp4')} />
            {currentSubtitle && (
                <FloatingSubtitle
                    key={currentSubtitle.id} // Re-mount on subtitle change to reset animation
                    text={currentSubtitle.text}
                    enterFrame={currentSubtitle.start * fps}
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
                />
            )}
        </AbsoluteFill>
    );
};
