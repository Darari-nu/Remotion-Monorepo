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
import { Subtitle } from './Subtitle';
import { z } from 'zod'; // Import zod if we want to add props later

// Define the interface locally or import it. Since srtParser has it exported, we can use it.
// However, the JSON structure from our Python script is:
// { id: number, start: number, end: number, text: string }
// But srtParser's SubtitleItem expects startTime, endTime.
// Let's check the JSON or defining a new interface.
// The Python script outputs: {"id": ..., "start": ..., "end": ..., "text": ...}
// So we need to map it or define a matching interface.

interface WhisperSubtitleItem {
    id: number;
    start: number;
    end: number;
    text: string;
}

export const StandardSubtitleComposition: React.FC = () => {
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
                <Subtitle
                    text={currentSubtitle.text}
                    style={{
                        fontSize: 50,
                        color: '#ffffff',
                        backgroundColor: 'rgba(0,0,0,0.6)',
                        padding: 20,
                        borderRadius: 10,
                        bottomOffset: 80,
                        fontFamily: 'sans-serif',
                    }}
                />
            )}
        </AbsoluteFill>
    );
};
