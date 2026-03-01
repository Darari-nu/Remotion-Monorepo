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
import { RetroSubtitle } from './RetroSubtitle';
import { z } from 'zod';

// Define props schema
export const standardSubtitleV2Schema = z.object({
    fontSize: z.number().default(80),
    color: z.string().default('#ffffff'),
    letterSpacing: z.string().default('0.1em'),
    animationSpeed: z.number().default(15), // Frames per character fade
});

// Define the interface locally or import it. Since srtParser has it exported, we can use it.
interface WhisperSubtitleItem {
    id: number;
    start: number;
    end: number;
    text: string;
}

export const StandardSubtitleCompositionV2: React.FC<z.infer<typeof standardSubtitleV2Schema>> = ({
    fontSize,
    color,
    letterSpacing,
    animationSpeed,
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
                <RetroSubtitle
                    key={currentSubtitle.id} // Re-mount on subtitle change to reset animation
                    text={currentSubtitle.text}
                    enterFrame={currentSubtitle.start * fps}
                    fontSize={fontSize}
                    color={color}
                    letterSpacing={letterSpacing}
                    animationSpeed={animationSpeed}
                />
            )}
        </AbsoluteFill>
    );
};
