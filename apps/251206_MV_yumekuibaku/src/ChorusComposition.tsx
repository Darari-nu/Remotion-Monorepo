import React, { useEffect, useState } from 'react';
import {
    staticFile,
    delayRender,
    continueRender,
    AbsoluteFill,
    Video,
    useVideoConfig,
    useCurrentFrame,
} from 'remotion';
import { KineticLyricEngine, kineticLyricEngineSchema } from './KineticLyricEngine';
import { z } from 'zod';

// Define SubtitleItem type as it's no longer imported from srtParser
interface SubtitleItem {
    id: number;
    startTime: number;
    endTime: number;
    text: string;
}

export const chorusCompositionSchema = z.object({
    baseFontSize: kineticLyricEngineSchema.shape.baseFontSize,
    kanjiScale: kineticLyricEngineSchema.shape.kanjiScale,
    hiraganaScale: kineticLyricEngineSchema.shape.hiraganaScale,
});

export const ChorusComposition: React.FC<z.infer<typeof chorusCompositionSchema>> = ({
    baseFontSize,
    kanjiScale,
    hiraganaScale,
}) => {
    const [subtitles, setSubtitles] = useState<SubtitleItem[]>([]);
    const [handle] = useState(() => delayRender());
    const { fps } = useVideoConfig();


    // Chorus Constants for fetching and slicing
    // const CHORUS_START_TIME = 64.25; // No longer needed for relative JSON
    // const VIDEO_DURATION = 29.29; // No longer needed, use video config or actual video duration

    // Switch to JSON created by Whisper
    useEffect(() => {
        fetch(staticFile('remotion_subtitles.json'))
            .then((res) => {
                if (!res.ok) throw new Error('Subtitle JSON fetch failed');
                return res.json();
            })
            .then((data) => {
                // Map JSON structure to SubtitleItem
                // JSON: { id, start, end, text }
                // SubtitleItem: { id, startTime, endTime, text }
                const items: SubtitleItem[] = data.map((item: any) => ({
                    id: item.id,
                    startTime: item.start,
                    endTime: item.end,
                    text: item.text
                }));
                console.log('JSON Subtitles Loaded:', items.length);
                setSubtitles(items);
                continueRender(handle);
            })
            .catch((err) => {
                console.error('Failed to load subtitles', err);
                continueRender(handle);
            });
    }, [handle]);

    // Use subtitles directly (timestamps are already relative 0-30s)
    const chorusSubtitles = subtitles;

    // Debug: Check count
    // console.log('Chorus Subtitles:', chorusSubtitles.length);

    return (
        <AbsoluteFill style={{ backgroundColor: '#111' }}>
            {/* Fallback Text if Video fails/loads */}
            <div style={{ position: 'absolute', top: 20, left: 20, color: 'gray', zIndex: 0 }}>
                {/* Background: yumekuibaku_720p.mp4 loaded */}
            </div>

            {/* Background Video */}
            <Video
                src={staticFile('yumekuibaku_720p.mp4')}
                style={{ zIndex: 1 }}
                onError={(e) => console.error('Video Error:', e)}
            />

            {/* Kinetic Lyric Overlay */}
            {chorusSubtitles.length > 0 ? (
                <div style={{ zIndex: 2, position: 'absolute', width: '100%', height: '100%' }}>
                    <KineticLyricEngine
                        subtitles={chorusSubtitles}
                        isTransparent={true}
                        seed={42}
                        baseFontSize={baseFontSize}
                        kanjiScale={kanjiScale}
                        hiraganaScale={hiraganaScale}
                    />
                </div>
            ) : (
                <div style={{ color: 'white', zIndex: 2, paddingTop: 100, textAlign: 'center' }}>
                    Loading Sabi Lyrics...
                </div>
            )}
        </AbsoluteFill>
    );
};
